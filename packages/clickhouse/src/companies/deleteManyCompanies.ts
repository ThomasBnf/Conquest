import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

type Props = {
  ids: string[];
};

export const deleteManyCompanies = async ({ ids }: Props) => {
  const parsedIds = ids.map((id) => `'${id}'`).join(",");

  const result = await client.query({
    query: `
      SELECT *  
      FROM member FINAL
      WHERE companyId IN (${parsedIds})
    `,
  });

  const { data } = await result.json();
  const members = MemberSchema.array().parse(data);

  const updatedMembers = members.map((member) => ({
    ...member,
    companyId: null,
    updatedAt: new Date(),
  }));

  await client.insert({
    table: "member",
    values: updatedMembers,
    format: "JSON",
  });

  await client.query({
    query: `
      ALTER TABLE company
      DELETE WHERE id IN (${parsedIds})
    `,
  });
};
