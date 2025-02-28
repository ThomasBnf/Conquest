import type { GroupFilters } from "@conquest/zod/schemas/filters.schema";
import { randomUUID } from "node:crypto";
import { client } from "../client";
import { getList } from "./getList";

type Props = {
  emoji: string;
  name: string;
  groupFilters: GroupFilters;
  workspace_id: string;
};

export const createList = async ({
  emoji,
  name,
  groupFilters,
  workspace_id,
}: Props) => {
  const id = randomUUID();

  await client.insert({
    table: "lists",
    values: {
      emoji,
      name,
      group_filters: groupFilters,
      workspace_id,
    },
    format: "JSONEachRow",
  });

  return getList({ id });
};
