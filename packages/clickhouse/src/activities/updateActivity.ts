import type { Activity } from "@conquest/zod/schemas/activity.schema";
import { client } from "../client";

type Props = Activity;

const escapeValue = (value: unknown): string => {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (value instanceof Date) return `'${value.toISOString()}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
};

export const updateActivity = async ({
  id,
  externalId,
  workspaceId,
  updatedAt,
  createdAt,
  ...data
}: Props) => {
  const values = Object.entries(data)
    .map(([key, value]) => `${key} = ${escapeValue(value)}`)
    .join(", ");

  await client.query({
    query: `
      ALTER TABLE activity
      UPDATE ${values}, updatedAt = now()
      WHERE id = '${id}' 
    `,
    format: "JSON",
  });
};
