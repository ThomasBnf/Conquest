import type { Member } from "@conquest/zod/schemas/member.schema";
import { format } from "date-fns";
import { client } from "../client";

type Props = Member;

export const updateMember = async (props: Props) => {
  const { createdAt, updatedAt, firstActivity, lastActivity, ...rest } = props;

  await client.insert({
    table: "member",
    values: [
      {
        ...rest,
        firstActivity: firstActivity
          ? format(new Date(firstActivity), "yyyy-MM-dd HH:mm:ss")
          : null,
        lastActivity: lastActivity
          ? format(new Date(lastActivity), "yyyy-MM-dd HH:mm:ss")
          : null,
        createdAt: format(new Date(createdAt), "yyyy-MM-dd HH:mm:ss"),
        updatedAt: format(new Date(updatedAt), "yyyy-MM-dd HH:mm:ss"),
      },
    ],
    format: "JSON",
  });
};
