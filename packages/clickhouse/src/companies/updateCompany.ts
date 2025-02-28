import type { Company } from "@conquest/zod/schemas/company.schema";
import { client } from "../client";

type Props = {
  id: string;
  data: Omit<Partial<Company>, "updated_at">;
};

export const updateCompany = async ({ id, data }: Props) => {
  const values = Object.entries(data)
    .map(([key, value]) => {
      if (["secondary_emails", "phones", "tags"].includes(key)) {
        if (Array.isArray(value) && value.length === 0) {
          return `${key} = []`;
        }
        return `${key} = ['${(value as string[]).join("','")}']`;
      }
      return `${key} = '${value}'`;
    })
    .join(",");

  await client.query({
    query: `
      ALTER TABLE companies
      UPDATE
        ${values},
        updated_at = now()
      WHERE id = '${id}'
    `,
  });
};
