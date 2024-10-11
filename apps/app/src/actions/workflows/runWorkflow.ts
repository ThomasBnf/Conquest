"use server";

import { updateContact } from "@/actions/contacts/updateContact";
import { authAction } from "@/lib/authAction";
import { listContacts } from "@/queries/contacts/listContacts";
import { getWorkflow } from "@/queries/workflows/getWorkflow";
import {
    Activity,
    ContactWithActivities,
} from "@/schemas/activity.schema";
import {
    FilterCountSchema,
    FilterDate,
    FilterDateSchema,
    FilterSelectSchema,
} from "@/schemas/filters.schema";
import {
    Node,
    NodeDataSchema,
    NodeListRecordsSchema,
    NodeSchema,
    NodeTagContactSchema,
    NodeWebhookSchema,
} from "@/schemas/node.schema";
import { startOfDay, subDays } from "date-fns";
import { z } from "zod";

let records: ContactWithActivities[] | undefined = undefined;

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
    const edgeMap = new Map(workflow.edges.map((edge) => [edge.source, edge.target]));

    const executeNode = async (nodeId: string) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      const { type } = NodeDataSchema.parse(node.data);

      switch (type) {
        case "list-records": {
          const { source } = NodeListRecordsSchema.parse(node.data);

          if (source === "contacts") {
            const rContacts = await listContacts({});
            records = rContacts?.data;

            if (!records?.length) throw new Error("No contacts found");

            records = await executeListContacts(node);
          }
          break;
        }
        case "add-tag": {
          await addTagContact(node);
          break;
        }
        case "remove-tag": {
          await removeTagContact(node);
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

const executeListContacts = async (node: Node) => {
  const { group_filters } = NodeListRecordsSchema.parse(node.data);

  return records?.filter((contact) => {
    let activities: Activity[] = [];

    return group_filters.every((group) => {
      const { filters, category } = group;

      switch (category) {
        case "activities": {
          activities = contact.activities;
          break;
        }
        case "activities_count": {
          activities = contact.activities;
          break;
        }
        case "last_activity": {
          activities = contact.activities?.slice(-1) ?? [];
          break;
        }
        case "first_activity": {
          activities = contact.activities?.slice(0, 1) ?? [];
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
                return activities.some((activity) => values.includes(activity.details.type));
              }
              case "not_contains": {
                return activities.every((activity) => !values.includes(activity.details.type));
              }
            }
          }
          case "source": {
            const { operator, values } = FilterSelectSchema.parse(filter);
            switch (operator) {
              case "contains": {
                return activities.some((activity) => values.includes(activity.details.source));
              }
              case "not_contains": {
                return activities.every((activity) => !values.includes(activity.details.source));
              }
            }
          }
          case "created_at": {
            const { operator } = FilterDateSchema.parse(filter);
            const date = getDynamicDate(filter);

            if (!date) return false;

            switch (operator) {
              case "is": {
                return activities.some((activity) => startOfDay(activity.created_at) === date);
              }
              case "is_not": {
                return activities.every((activity) => startOfDay(activity.created_at) !== date);
              }
              case "after": {
                return activities.some((activity) => activity.created_at > date);
              }
              case "before": {
                return activities.every((activity) => activity.created_at < date);
              }
            }
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

const addTagContact = async (node: Node) => {
  const { tags } = NodeTagContactSchema.parse(node.data);

  if (tags.length === 0) return;

  records?.forEach((contact) => {
    const contactTags = contact.tags;
    const hasTags = tags.some((tag) => contactTags.includes(tag));

    if (!hasTags) {
      updateContact({ id: contact.id, tags: [...contactTags, ...tags] });
    }
  });
};

const removeTagContact = async (node: Node) => {
  const { tags } = NodeTagContactSchema.parse(node.data);

  if (tags.length === 0) return;

  records?.forEach((contact) => {
    const contactTags = contact.tags;
    const hasTags = tags.some((tag) => contactTags.includes(tag));

    if (hasTags) {
      updateContact({ id: contact.id, tags: contactTags.filter((tag) => !tags.includes(tag)) });
    }
  });
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
