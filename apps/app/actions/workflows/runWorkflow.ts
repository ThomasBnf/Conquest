"use server";

import type {
  Activity,
  MemberWithActivities,
} from "@conquest/zod/activity.schema";
import {
  FilterCountSchema,
  type FilterDate,
  FilterDateSchema,
  FilterSelectSchema,
} from "@conquest/zod/filters.schema";
import {
  type Node,
  NodeDataSchema,
  NodeListRecordsSchema,
  NodeSchema,
  NodeTagMemberSchema,
  NodeWebhookSchema,
} from "@conquest/zod/node.schema";
import { updateMember } from "actions/members/updateMember";
import { startOfDay, subDays } from "date-fns";
import { authAction } from "lib/authAction";
import { listMembers } from "queries/members/listMembers";
import { getWorkflow } from "queries/workflows/getWorkflow";
import { z } from "zod";

let records: MemberWithActivities[] | undefined = undefined;

export const runWorkflow = authAction
  .metadata({
    name: "runWorkflow",
  })
  .schema(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { id } }) => {
    const rWorkflow = await getWorkflow({ id });
    const workflow = rWorkflow?.data;

    if (!workflow) throw new Error("Workflow not found");

    const nodeMap = new Map(workflow.nodes.map((node) => [node.id, node]));
    const edgeMap = new Map(
      workflow.edges.map((edge) => [edge.source, edge.target]),
    );

    const executeNode = async (nodeId: string) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      const { type } = NodeDataSchema.parse(node.data);

      switch (type) {
        case "list-records": {
          const { source } = NodeListRecordsSchema.parse(node.data);

          if (source === "members") {
            const rMembers = await listMembers({});
            records = rMembers?.data;

            if (!records?.length) throw new Error("No members found");

            records = await executeListMembers(node);
          }
          break;
        }
        case "add-tag": {
          await addTagMember(node);
          break;
        }
        case "remove-tag": {
          await removeTagMember(node);
          break;
        }
        case "webhook": {
          await executeWebhook(node);
          break;
        }
      }

      const nextNodeId = edgeMap.get(nodeId);
      if (nextNodeId) {
        await executeNode(nextNodeId);
      }
    };

    const startNodeId = workflow.nodes.find(
      (node) => !workflow.edges.some((edge) => edge.target === node.id),
    )?.id;

    if (startNodeId) {
      const { data } = NodeSchema.parse(nodeMap.get(startNodeId));
      const { type } = data;

      if (data && type.startsWith("trigger")) {
        await executeNode(startNodeId);
      } else {
        throw new Error("Workflow must start with a trigger node");
      }
    } else {
      throw new Error("No start node found in the workflow");
    }

    return records;
  });

const executeListMembers = async (node: Node) => {
  const { group_filters } = NodeListRecordsSchema.parse(node.data);

  return records?.filter((member) => {
    let activities: Activity[] = [];

    return group_filters.every((group) => {
      const { filters, category } = group;

      switch (category) {
        case "activities": {
          activities = member.activities;
          break;
        }
        case "activities_count": {
          activities = member.activities;
          break;
        }
        case "last_activity": {
          activities = member.activities?.slice(-1) ?? [];
          break;
        }
        case "first_activity": {
          activities = member.activities?.slice(0, 1) ?? [];
          break;
        }
      }

      if (activities.length === 0) return false;

      return filters.every((filter) => {
        const { field } = filter;

        switch (field) {
          case "type": {
            const { operator, values } = FilterSelectSchema.parse(filter);
            switch (operator) {
              case "contains": {
                return activities.some((activity) =>
                  values.includes(activity.details.type),
                );
              }
              case "not_contains": {
                return activities.every(
                  (activity) => !values.includes(activity.details.type),
                );
              }
            }
            break;
          }
          case "source": {
            const { operator, values } = FilterSelectSchema.parse(filter);
            switch (operator) {
              case "contains": {
                return activities.some((activity) =>
                  values.includes(activity.details.source),
                );
              }
              case "not_contains": {
                return activities.every(
                  (activity) => !values.includes(activity.details.source),
                );
              }
            }
            break;
          }
          case "created_at": {
            const { operator } = FilterDateSchema.parse(filter);
            const date = getDynamicDate(filter);

            if (!date) return false;

            switch (operator) {
              case "is": {
                return activities.some(
                  (activity) => startOfDay(activity.created_at) === date,
                );
              }
              case "is_not": {
                return activities.every(
                  (activity) => startOfDay(activity.created_at) !== date,
                );
              }
              case "after": {
                return activities.some(
                  (activity) => activity.created_at > date,
                );
              }
              case "before": {
                return activities.every(
                  (activity) => activity.created_at < date,
                );
              }
            }
            break;
          }
          case "activities_count": {
            const { operator, value } = FilterCountSchema.parse(filter);

            switch (operator) {
              case "equals": {
                return activities.length === value;
              }
              case "not_equals": {
                return activities.length !== value;
              }
              case "greater_than": {
                return activities.length > value;
              }
              case "less_than": {
                return activities.length < value;
              }
            }
          }
        }
      });
    });
  });
};

const addTagMember = async (node: Node) => {
  const { tags } = NodeTagMemberSchema.parse(node.data);

  if (tags.length === 0) return;

  for (const member of records ?? []) {
    const memberTags = member.tags;
    const hasTags = tags.some((tag) => memberTags.includes(tag));

    if (!hasTags) {
      await updateMember({ id: member.id, tags: [...memberTags, ...tags] });
    }
  }
};

const removeTagMember = async (node: Node) => {
  const { tags } = NodeTagMemberSchema.parse(node.data);

  if (tags.length === 0) return;

  for (const member of records ?? []) {
    const memberTags = member.tags;
    const hasTags = tags.some((tag) => memberTags.includes(tag));

    if (hasTags) {
      await updateMember({
        id: member.id,
        tags: memberTags.filter((tag) => !tags.includes(tag)),
      });
    }
  }
};

const executeWebhook = async (node: Node) => {
  const { url } = NodeWebhookSchema.parse(node.data);

  if (!url) throw new Error("No URL provided");

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(records),
  });
};

const getDynamicDate = (filter: FilterDate) => {
  const { dynamic_date, days } = filter;

  switch (dynamic_date) {
    case "today": {
      return startOfDay(new Date());
    }
    case "yesterday": {
      return subDays(startOfDay(new Date()), 1);
    }
    case "7_days_ago": {
      return subDays(startOfDay(new Date()), 7);
    }
    case "30_days_ago": {
      return subDays(startOfDay(new Date()), 30);
    }
    case "days_ago": {
      return subDays(startOfDay(new Date()), days);
    }
  }
};
