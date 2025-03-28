import { type Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import { client } from "../client";
import { mergeMembers } from "./mergeMembers";

type Props = {
  members: Member[] | undefined;
};

export const batchMergeMembers = async ({ members }: Props) => {
  for (const member of members ?? []) {
    const { primary_email, workspace_id } = member;

    if (!primary_email) continue;

    const result = await client.query({
      query: `
        SELECT *
        FROM member
        WHERE 
          primary_email = '${primary_email}'
          AND workspace_id = '${workspace_id}'
      `,
      format: "JSON",
    });

    const { data } = await result.json();
    const membersWithSameEmail = MemberSchema.array().parse(data);

    if (membersWithSameEmail.length <= 1) continue;

    const memberReference = membersWithSameEmail.reduce(
      (oldest, current) => {
        if (!current.first_activity) return oldest;
        if (!oldest?.first_activity) return current;
        return current.first_activity < oldest.first_activity
          ? current
          : oldest;
      },
      null as Member | null,
    );

    if (!memberReference) continue;

    const otherMembers = membersWithSameEmail.filter(
      (m) => m.id !== memberReference.id,
    );

    for (const otherMember of otherMembers) {
      await mergeMembers({
        leftMember: otherMember,
        rightMember: memberReference,
      });
    }
  }
};
