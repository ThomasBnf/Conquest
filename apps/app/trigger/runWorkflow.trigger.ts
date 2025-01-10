import { prisma } from "@/lib/prisma";
import {
  type Activity,
  type ActivityWithType,
  type MemberWithActivities,
  MemberWithActivitiesSchema,
} from "@conquest/zod/schemas/activity.schema";
import type {
  Filter,
  FilterActivity,
  FilterDate,
  FilterLevel,
  FilterNumber,
  FilterSelect,
  FilterText,
} from "@conquest/zod/schemas/filters.schema";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import {
  NodeSchema,
  type NodeSlackMessage,
  type NodeTagMember,
  type NodeWebhook,
} from "@conquest/zod/schemas/node.schema";
import { WorkflowSchema } from "@conquest/zod/schemas/workflow.schema";
import { WebClient } from "@slack/web-api";
import { task, wait } from "@trigger.dev/sdk/v3";
import { compareDesc, startOfDay, subDays } from "date-fns";
import { z } from "zod";

let members: MemberWithActivities[] = [];
let createdMember: MemberWithActivities | null = null;

export const runWorkflowTrigger = task({
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
  const members = await prisma.members.findMany({
    where: {
      workspace_id,
    },
    include: {
      activities: {
        include: {
          activity_type: true,
        },
      },
      company: true,
    },
  });

  return MemberWithActivitiesSchema.array().parse(
    members.map((member) => ({
      ...member,
      activities: member.activities?.sort((a, b) =>
        compareDesc(b.created_at, a.created_at),
      ),
    })),
  );
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
    case "level":
      return createLevelFilter(filter);
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
          if (field === "primary_email") {
            return member.primary_email?.includes(value);
          }
          if (field === "phones") {
            return member.phones?.some((phone) => phone.includes(value));
          }
          return member[field]?.includes(value);
        case "not_contains":
          if (field === "primary_email") {
            return !member.primary_email?.includes(value);
          }
          if (field === "phones") {
            return !member.phones?.some((phone) => phone.includes(value));
          }
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
          case "pulse":
            return member.pulse;
        }
      })();

      switch (operator) {
        case "greater":
          return field > value;
        case "greater or equal":
          return field >= value;
        case "equal":
          return field === value;
        case "not equal":
          return field !== value;
        case "less or equal":
          return field <= value;
        case "less":
          return field < value;
        default:
          return true;
      }
    },
  };
};

const createLevelFilter = (filter: FilterLevel) => {
  const { operator, value } = filter;

  return {
    execute: ({ member }: { member: MemberWithActivities }) => {
      const field = (() => {
        switch (filter.field) {
          case "level":
            return member.level;
        }
      })();

      switch (operator) {
        case "greater":
          return field > value;
        case "greater or equal":
          return field >= value;
        case "equal":
          return field === value;
        case "not equal":
          return field !== value;
        case "less or equal":
          return field <= value;
        case "less":
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
          case "location":
            return member.location;
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
  const { activity_types, operator, value } = filter;

  return {
    execute: ({ activities }: { activities: ActivityWithType[] }) => {
      if (!activities?.length) return false;

      const compareDate = getDynamicDate(filter);
      if (!compareDate) return false;

      const filteredActivities = activities.filter((activity) => {
        const activityDate = startOfDay(new Date(activity.created_at));
        const matchesType = activity_types.some(
          (activityType) => activityType.key === activity.activity_type.key,
        );
        const matchesDate = activityDate >= compareDate;

        return matchesType && matchesDate;
      });

      const count = filteredActivities.length;

      switch (operator) {
        case "less":
          return count < value;
        case "less or equal":
          return count <= value;
        case "equal":
          return count === value;
        case "not equal":
          return count !== value;
        case "greater":
          return count > value;
        case "greater or equal":
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
