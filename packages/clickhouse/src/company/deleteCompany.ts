import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

type Props = {
  id: string;
};

export const deleteCompany = async ({ id }: Props) => {
  const result = await client.query({
    query: `
      SELECT *  
      FROM member FINAL
      WHERE companyId = '${id}'
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
      DELETE WHERE id = '${id}'
    `,
  });
};
