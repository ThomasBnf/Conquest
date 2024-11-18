import { getPoints } from "@/features/members/helpers/getPoints";
import { prisma } from "@/lib/prisma";
import {
  type Activity,
  type MemberWithActivities,
  MemberWithActivitiesSchema,
} from "@conquest/zod/activity.schema";
import type {
  Filter,
  FilterDate,
  FilterNumber,
  FilterSelect,
  FilterTag,
} from "@conquest/zod/filters.schema";
import {
  type Integration,
  IntegrationSchema,
  SlackIntegrationSchema,
} from "@conquest/zod/integration.schema";
import {
  type Category,
  type GroupFilter,
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
let integrations: Integration[];

export const runWorkflow = task({
  id: "run-workflow",
  run: async (payload: { workflow_id: string }) => {
    const { workflow_id } = payload;

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflow_id },
    });
    const parsedWorkflow = WorkflowSchema.parse(workflow);
    const { nodes, edges, workspace_id } = parsedWorkflow;

    integrations = IntegrationSchema.array().parse(
      await prisma.integration.findMany({
        where: {
          workspace_id,
        },
      }),
    );

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

          const { group_filters } = parsedNode.data;

          members =
            group_filters?.length > 0
              ? filterMembers(parsedMembers, group_filters)
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
  return await prisma.member.findMany({
    where: {
      workspace_id,
    },
    include: {
      activities: {
        orderBy: {
          created_at: "desc",
        },
      },
    },
  });
};

export const addTag = async (node: NodeTagMember) => {
  const { tags } = node;

  if (tags.length === 0) return;

  for (const member of members ?? []) {
    const memberTags = member.tags;
    const hasTags = tags.some((tag) => memberTags.includes(tag));

    if (!hasTags) {
      await prisma.member.update({
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
      await prisma.member.update({
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
  const { url } = node;

  if (!url) throw new Error("No URL provided");

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(members),
  });
};

export const slackMessage = async (
  node: NodeSlackMessage,
  workspace_id: string,
) => {
  const slack = await prisma.integration.findFirst({
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
  groupFilters: GroupFilter[],
) => {
  if (!groupFilters?.length) return members;

  return members.filter((member) =>
    groupFilters.every((group) => {
      if (!group.filters?.length) return true;

      const record = getRecordForCategory(member, group.category);
      if (!record) return false;

      return group.filters.every((filter) => {
        const operation = createFilterOperation(filter);
        return operation.execute({
          member: record,
          activities: record.activities || [],
        });
      });
    }),
  );
};

const getRecordForCategory = (
  member: MemberWithActivities,
  category: Category,
): MemberWithActivities | null => {
  if (!member) return null;

  switch (category) {
    case "last_activity":
      return {
        ...member,
        activities: member.activities?.slice(-1) || [],
      };
    case "first_activity":
      return {
        ...member,
        activities: member.activities?.slice(0, 1) || [],
      };
    default:
      return member;
  }
};

const createFilterOperation = (filter: Filter) => {
  if (!filter?.field) return { execute: () => true };

  switch (filter.field) {
    case "localisation":
      return createLocaleFilter(filter);
    case "type":
      return createTypeFilter(filter);
    case "source":
      return createSourceFilter(filter);
    case "tags":
      return createTagFilter(filter);
    case "created_at":
      return createDateFilter(filter);
    case "points":
      return createNumberFilter(filter);
    default:
      return { execute: () => true };
  }
};

export const createLocaleFilter = (filter: FilterSelect) => {
  const { operator, values } = filter;

  if (!values?.length) return { execute: () => true };

  return {
    execute: ({ member }: { member: MemberWithActivities }) => {
      const memberLocale = member.locale;

      switch (operator) {
        case "contains":
          return values.includes(memberLocale ?? "");
        case "not_contains":
          return !values.includes(memberLocale ?? "");
        default:
          return true;
      }
    },
  };
};

export const createTypeFilter = (filter: FilterSelect) => {
  const { operator, values } = filter;

  if (!values?.length) return { execute: () => true };

  return {
    execute: ({ activities }: { activities: Activity[] }) => {
      if (!activities?.length) return false;

      switch (operator) {
        case "contains":
          return activities.some((activity) =>
            values.includes(activity.details.type),
          );
        case "not_contains":
          return activities.every(
            (activity) => !values.includes(activity.details.type),
          );
        default:
          return true;
      }
    },
  };
};

export const createSourceFilter = (filter: FilterSelect) => {
  const { operator, values } = filter;

  if (!values?.length) return { execute: () => true };

  return {
    execute: ({ activities }: { activities: Activity[] }) => {
      if (!activities?.length) return false;

      switch (operator) {
        case "contains":
          return activities.some((activity) =>
            values.includes(activity.details.source),
          );
        case "not_contains":
          return activities.every(
            (activity) => !values.includes(activity.details.source),
          );
        default:
          return true;
      }
    },
  };
};

export const createTagFilter = (filter: FilterTag) => {
  const { operator, values } = filter;

  if (!values?.length) return { execute: () => true };

  return {
    execute: ({ member }: { member: MemberWithActivities }) => {
      const memberTags = member.tags || [];

      switch (operator) {
        case "contains":
          return values.some((value) => memberTags.includes(value));
        case "not_contains":
          return !values.some((value) => memberTags.includes(value));
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
        case "after":
          return activities.some(
            (activity) => new Date(activity.created_at) > compareDate,
          );
        case "before":
          return activities.every(
            (activity) => new Date(activity.created_at) < compareDate,
          );
        default:
          return true;
      }
    },
  };
};

export const createNumberFilter = (filter: FilterNumber) => {
  const { operator, value } = filter;
  if (typeof value !== "number") return { execute: () => true };

  return {
    execute: ({ member }: { member: MemberWithActivities }) => {
      const points = getPoints({ integrations, member });

      console.log(points);

      switch (operator) {
        case "equals":
          return points === value;
        case "not_equals":
          return points !== value;
        case "greater_than":
          return points > value;
        case "less_than":
          return points < value;
        default:
          return true;
      }
    },
  };
};

const getDynamicDate = (filter: FilterDate) => {
  const { dynamic_date, days } = filter;
  if (!dynamic_date) return null;

  const today = startOfDay(new Date());

  switch (dynamic_date) {
    case "today":
      return today;
    case "yesterday":
      return subDays(today, 1);
    case "7_days_ago":
      return subDays(today, 7);
    case "30_days_ago":
      return subDays(today, 30);
    case "days_ago":
      return typeof days === "number" ? subDays(today, days) : null;
    default:
      return null;
  }
};
