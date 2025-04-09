import type { Member } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";

type Props = Member;

export const updateMember = async (props: Props) => {
  const { id, ...rest } = props;

  await client.insert({
    table: "member",
    values: [
      {
        ...props,
        updated_at: new Date(),
      },
    ],
    format: "JSON",
  });

  await client.query({
    query: "OPTIMIZE TABLE member FINAL;",
  });
};
