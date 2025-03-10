import type { Member } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import { client } from "../client";

type Props = Member;

export const updateMember = async (props: Props) => {
  const { id, workspace_id, updated_at, ...data } = props;

  const escapeValue = (value: string) =>
    value.replace(/'/g, "\\'").replace(/"/g, '\\"');

  const values = Object.entries(data)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key} = [${value.map((v) => `'${escapeValue(String(v))}'`).join(",")}]`;
      }
      if (value instanceof Date) {
        return `${key} = '${format(value, "yyyy-MM-dd HH:mm:ss")}'`;
      }
      return `${key} = '${escapeValue(String(value))}'`;
    })
    .join(", ");

  await client.query({
    query: `
      ALTER TABLE member
      UPDATE ${values}, updated_at = now()
      WHERE id = '${id}'
    `,
  });
};
