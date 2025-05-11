import type { Member } from "@conquest/zod/schemas/member.schema";
import { addHours } from "date-fns";
import { client } from "../client";

type Props = Member;

export const updateMember = async (props: Props) => {
  await client.insert({
    table: "member",
    values: [
      {
        ...props,
        updatedAt: addHours(new Date(), 2),
      },
    ],
    format: "JSON",
  });

  await client.query({
    query: "OPTIMIZE TABLE member FINAL;",
  });
};
