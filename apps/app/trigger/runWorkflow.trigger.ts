import { prisma } from "@/lib/prisma";
import {
  type Activity,
  type ActivityWithType,
  type MemberWithActivities,
  MemberWithActivitiesSchema,
} from "@conquest/zod/activity.schema";
import type {
  Filter,
  FilterActivity,
  FilterDate,
  FilterNumber,
  FilterSelect,
  FilterText,
} from "@conquest/zod/filters.schema";
import { SlackIntegrationSchema } from "@conquest/zod/integration.schema";
import { MemberSchema } from "@conquest/zod/member.schema";
import {
  NodeSchema,
  type NodeSlackMessage,
  type NodeTagMember,
  type NodeWebhook,
} from "@conquest/zod/node.schema";
import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { WebClient } from "@slack/web-api";
import { task, wait } from "@trigger.dev/sdk/v3";
import { startOfDay, subDays } from "date-fns";
import { z } from "zod";

let members: MemberWithActivities[] = [];
let createdMember: MemberWithActivities | null = null;

export const runWorkflow = task({
  id: "run-workflow",
  run: async (payload: {
    workflow_id: string;
    created_member?: MemberWithActivities;
  }) => {
    const { workflow_id, created_member } = payload;
    createdMember = created_member ?? null;

    const workflow = await prisma.workflows.findUnique({
      where: { id: workflow_id },
    });
    const parsedWorkflow = WorkflowSchema.parse(workflow);
    const { nodes, edges, workspace_id } = parsedWorkflow;

    let node = nodes.find((node) => "isTrigger" in node.data);
    let hasNextNode = true;

    while (hasNextNode) {
      const parsedNode = NodeSchema.parse(node);
      const { type } = parsedNode.data;

      switch (type) {
        case "list-members": {
          const _members = await listMembers(workspace_id);
          const parsedMembers = z
            .array(MemberWithActivitiesSchema)
            .parse(_members);

          const { filters } = parsedNode.data;

          members =
            filters?.length > 0
              ? filterMembers(parsedMembers, filters)
              : parsedMembers;

          break;
        }
        case "add-tag": {
          await addTag(parsedNode.data);
          break;
        }
        case "remove-tag": {
          await removeTag(parsedNode.data);
          break;
        }
        case "slack-message": {
          await slackMessage(parsedNode.data, workspace_id);
          break;
        }
        case "webhook": {
          await webhook(parsedNode.data);
          break;
        }
        case "wait": {
          const { duration, unit } = parsedNode.data;

          const timeMap = {
            seconds: 1,
            minutes: 60,
            hours: 60 * 60,
            days: 24 * 60 * 60,
          } as const;

          const milliseconds = duration * timeMap[unit];
          await wait.for({ seconds: milliseconds });
          break;
        }
      }

      const edge = edges.find((edge) => edge.source === node?.id);
      if (!edge) {
        hasNextNode = false;
      } else {
        node = nodes.find((currentNode) => edge?.target === currentNode.id);
      }
    }

    return parsedWorkflow;
  },
});

export const listMembers = async (workspace_id: string) => {
  return await prisma.$queryRaw`
    SELECT 
            m.*,
            CAST(COALESCE(SUM(CASE 
                WHEN a.created_at > NOW() - INTERVAL '3 months' 
                THEN at.weight 
                ELSE 0 
            END), 0) AS INTEGER) as love,
            CAST(COALESCE(MAX(CASE 
                WHEN a.created_at > NOW() - INTERVAL '3 months' 
                THEN at.weight
                ELSE 0 
            END), 0) AS INTEGER) as level,
            COALESCE(
                json_agg(
                    CASE WHEN a.id IS NOT NULL THEN
                        json_build_object(
                            'id', a.id,
                            'external_id', COALESCE(a.external_id, ''),
                            'message', COALESCE(a.message, ''),
                            'reply_to', COALESCE(a.reply_to, ''),
                            'react_to', COALESCE(a.react_to, ''),
                            'invite_by', COALESCE(a.invite_by, ''),
                            'channel_id', a.channel_id,
                            'member_id', a.member_id,
                            'workspace_id', a.workspace_id,
                            'activity_type_id', a.activity_type_id,
                            'created_at', TO_CHAR(a.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                            'updated_at', TO_CHAR(a.updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
                            'activity_type', row_to_json(at.*)
                        )
                    ELSE NULL END
                    ORDER BY a.created_at DESC
                ) FILTER (WHERE a.id IS NOT NULL),
                '[]'::json
            ) as activities
        FROM 
            members m
            LEFT JOIN activities a ON m.id = a.member_id
            LEFT JOIN activities_types at ON a.activity_type_id = at.id
        WHERE 
            m.workspace_id = ${workspace_id}
        GROUP BY 
            m.id
      `;
};

export const addTag = async (node: NodeTagMember) => {
  const { tags } = node;

  if (tags.length === 0) return;

  for (const member of members ?? []) {
    const memberTags = member.tags;
    const hasTags = tags.some((tag) => memberTags.includes(tag));

    if (!hasTags) {
      await prisma.members.update({
        where: {
          id: member.id,
        },
        data: {
          tags: { push: tags },
        },
      });
    }
  }
};

export const removeTag = async (node: NodeTagMember) => {
  const { tags } = node;

  if (tags.length === 0) return;

  for (const member of members ?? []) {
    const memberTags = member.tags;
    const hasTags = tags.some((tag) => memberTags.includes(tag));

    if (hasTags) {
      await prisma.members.update({
        where: {
          id: member.id,
        },
        data: {
          tags: {
            set: memberTags.filter((tag) => !tags.includes(tag)),
          },
        },
      });
    }
  }
};

export const webhook = async (node: NodeWebhook) => {
  const { url, body } = node;

  if (!url) throw new Error("No URL provided");

  let formattedBody = body
    ?.replace(/\\n/g, "\n")
    .replace("{{created_member}}", JSON.stringify(createdMember, null, 2))
    .replace(
      "{{matching_members}}",
      JSON.stringify(
        members.map((member) => ({
          ...member,
          activities: member.activities?.length ?? 0,
        })),
        null,
        2,
      ),
    )
    .replace(
      "{{matching_members.count}}",
      JSON.stringify({ count: members?.length }),
    );

  for (const [key] of Object.entries(MemberSchema.shape)) {
    formattedBody = formattedBody?.replace(
      `{{created_member.${key}}}`,
      String(createdMember?.[key as keyof typeof createdMember] ?? null),
    );
  }

  for (const [key] of Object.entries(MemberSchema.shape)) {
    formattedBody = formattedBody?.replace(
      `{{matching_members.${key}}}`,
      JSON.stringify(
        members
          ?.map((member) => member[key as keyof typeof member])
          .filter(Boolean) ?? [],
      ),
    );
  }

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: formattedBody,
  });
};

export const slackMessage = async (
  node: NodeSlackMessage,
  workspace_id: string,
) => {
  const slack = await prisma.integrations.findFirst({
    where: {
      details: {
        path: ["source"],
        equals: "SLACK",
      },
      workspace_id,
    },
  });

  if (!slack) throw new Error("No Slack integration found");

  const { details } = SlackIntegrationSchema.parse(slack);
  const { slack_user_token } = details;
  const { message } = node;

  if (!slack_user_token) throw new Error("No Slack user token found");

  const web = new WebClient(slack_user_token);

  for (const member of members ?? []) {
    if (!member.slack_id) throw new Error("No Slack ID found");

    const { channel } = await web.conversations.open({
      users: member.slack_id,
    });

    if (!channel?.id) throw new Error("No channel ID found");

    await web.chat.postMessage({
      channel: channel?.id,
      text: message,
      as_user: true,
    });
  }
};

export const filterMembers = (
  members: MemberWithActivities[],
  filters: Filter[],
) => {
  if (!filters?.length) return members;

  return members.filter((member) => {
    return filters.every((filter) => {
      const operation = createFilterOperation(filter);
      return operation.execute({
        member,
        activities: member.activities || [],
      });
    });
  });
};

const createFilterOperation = (filter: Filter) => {
  switch (filter.type) {
    case "text":
      return createTextFilter(filter);
    case "number":
      return createNumberFilter(filter);
    case "select":
      return createSelectFilter(filter);
    case "date":
      return createDateFilter(filter);
    case "activity":
      return createActivityFilter(filter);
    default:
      return { execute: () => true };
  }
};

const createTextFilter = (filter: FilterText) => {
  const { field, operator, value } = filter;

  return {
    execute: ({ member }: { member: MemberWithActivities }) => {
      switch (operator) {
        case "contains":
          return member[field]?.includes(value);
        case "not_contains":
          return !member[field]?.includes(value);
        default:
          return true;
      }
    },
  };
};

const createNumberFilter = (filter: FilterNumber) => {
  const { operator, value } = filter;

  return {
    execute: ({ member }: { member: MemberWithActivities }) => {
      const field = (() => {
        switch (filter.field) {
          case "love":
            return member.love;
          case "level":
            return member.level;
        }
      })();

      switch (operator) {
        case ">":
          return field > value;
        case ">=":
          return field >= value;
        case "=":
          return field === value;
        case "!=":
          return field !== value;
        case "<=":
          return field <= value;
        case "<":
          return field < value;
        default:
          return true;
      }
    },
  };
};

export const createSelectFilter = (filter: FilterSelect) => {
  const { operator, values } = filter;

  if (!values?.length) return { execute: () => true };

  return {
    execute: ({ member }: { member: MemberWithActivities }) => {
      const field = (() => {
        switch (filter.field) {
          case "localisation":
            return member.localisation;
          case "tags":
            return member.tags;
          case "source":
            return member.source;
        }
      })();

      switch (operator) {
        case "contains":
          return values.some((value) => field?.includes(value));
        case "not_contains":
          return !values.some((value) => field?.includes(value));
        default:
          return true;
      }
    },
  };
};

export const createDateFilter = (filter: FilterDate) => {
  const { operator } = filter;
  const date = getDynamicDate(filter);

  if (!date) return { execute: () => true };

  return {
    execute: ({ activities }: { activities: Activity[] }) => {
      if (!activities?.length) return false;

      const compareDate = startOfDay(date);

      switch (operator) {
        case "is":
          return activities.some(
            (activity) =>
              startOfDay(new Date(activity.created_at)).getTime() ===
              compareDate.getTime(),
          );
        case "is_not":
          return activities.every(
            (activity) =>
              startOfDay(new Date(activity.created_at)).getTime() !==
              compareDate.getTime(),
          );
        default:
          return true;
      }
    },
  };
};

const createActivityFilter = (filter: FilterActivity) => {
  const { activity_type, operator, value, channel } = filter;

  return {
    execute: ({ activities }: { activities: ActivityWithType[] }) => {
      if (!activities?.length) return false;

      const compareDate = getDynamicDate(filter);
      if (!compareDate) return false;

      const filteredActivities = activities.filter((activity) => {
        const activityDate = startOfDay(new Date(activity.created_at));
        const matchesType = activity_type.some(
          (type) => type.key === activity.activity_type.key,
        );
        const matchesChannel =
          !channel.id || activity.channel_id === channel.id;
        const matchesDate = activityDate.getTime() >= compareDate.getTime();

        return matchesType && matchesChannel && matchesDate;
      });

      const count = filteredActivities.length;

      switch (operator) {
        case "<":
          return count < value;
        case "<=":
          return count <= value;
        case "=":
          return count === value;
        case "!=":
          return count !== value;
        case ">":
          return count > value;
        case ">=":
          return count >= value;
        default:
          return true;
      }
    },
  };
};

const getDynamicDate = (filter: FilterDate | FilterActivity) => {
  const { dynamic_date } = filter;
  if (!dynamic_date) return null;

  const today = startOfDay(new Date());

  switch (dynamic_date) {
    case "today":
      return today;
    case "yesterday":
      return subDays(today, 1);
    case "7 days":
      return subDays(today, 7);
    case "30 days":
      return subDays(today, 30);
    default:
      return null;
  }
};
