import type { Member } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

type Props = {
  members: Member[];
};

export const updateManyMembers = async ({ members }: Props) => {
  await client.insert({
    table: "member",
    values: members,
    format: "JSON",
  });

  await client.query({
    query: "OPTIMIZE TABLE member FINAL;",
  });
};
