import type { Member } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

type Props = Member;

export const updateMember = async (props: Props) => {
  await client.insert({
    table: "member",
    values: [
      {
        ...props,
        updatedAt: new Date(),
      },
    ],
    format: "JSON",
  });
};
