import { updateMember } from "@/features/members/functions/updateMember";
import { listMembers } from "@/features/members/queries/listMembers";
import { safeAction } from "@/lib/safeAction";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import {
  FilterCountSchema,
  type FilterDate,
  FilterDateSchema,
  FilterSelectSchema,
  FilterTagSchema,
} from "@conquest/zod/filters.schema";
import type { Node } from "@conquest/zod/node.schema";
import {
  NodeDataSchema,
  NodeListMembersSchema,
  NodeSchema,
  NodeTagMemberSchema,
  NodeWebhookSchema,
} from "@conquest/zod/node.schema";
import { startOfDay, subDays } from "date-fns";
import { z } from "zod";
import { _getWorkflow } from "../actions/_getWorkflow";

let records: MemberWithActivities[] | undefined = undefined;

export const runWorkflow = safeAction
  .metadata({
    name: "runWorkflow",
  })
  .schema(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { id } }) => {
    const rWorkflow = await _getWorkflow({ id });
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
        case "list-members": {
          const rMembers = await listMembers({});
          records = rMembers?.data;

          if (!records?.length) throw new Error("No members found");

          records = await executeListMembers(node);
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

      if (data && "isTrigger" in data) {
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
  const { group_filters } = NodeListMembersSchema.parse(node.data);

  return records?.filter((member) => {
    let record: MemberWithActivities;

    return group_filters.every((group) => {
      const { filters, category } = group;

      switch (category) {
        case "activities": {
          record = member;
          break;
        }
        case "last_activity": {
          record = {
            ...member,
            activities: member.activities?.slice(-1) ?? [],
          };
          break;
        }
        case "first_activity": {
          record = {
            ...member,
            activities: member.activities?.slice(0, 1) ?? [],
          };
          break;
        }
        case "activities_count": {
          record = member;
          break;
        }
        case "tags": {
          record = member;
          break;
        }
      }

      if (record.activities.length === 0) return false;

      return filters.every((filter) => {
        const { field } = filter;

        switch (field) {
          case "type": {
            const { operator, values } = FilterSelectSchema.parse(filter);
            switch (operator) {
              case "contains": {
                return record.activities.some((activity) =>
                  values.includes(activity.details.type),
                );
              }
              case "not_contains": {
                return record.activities.every(
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
                return record.activities.some((activity) =>
                  values.includes(activity.details.source),
                );
              }
              case "not_contains": {
                return record.activities.every(
                  (activity) => !values.includes(activity.details.source),
                );
              }
            }
            break;
          }
          case "tags": {
            const { operator, values } = FilterTagSchema.parse(filter);
            switch (operator) {
              case "contains": {
                return record.tags.some((tag) => values.includes(tag));
              }
              case "not_contains": {
                return record.tags.every((tag) => !values.includes(tag));
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
                return record.activities.some(
                  (activity) => startOfDay(activity.created_at) === date,
                );
              }
              case "is_not": {
                return record.activities.every(
                  (activity) => startOfDay(activity.created_at) !== date,
                );
              }
              case "after": {
                return record.activities.some(
                  (activity) => activity.created_at > date,
                );
              }
              case "before": {
                return record.activities.every(
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
                return record.activities.length === value;
              }
              case "not_equals": {
                return record.activities.length !== value;
              }
              case "greater_than": {
                return record.activities.length > value;
              }
              case "less_than": {
                return record.activities.length < value;
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
      await updateMember({
        id: member.id,
        tags: [...memberTags, ...tags],
      });
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
