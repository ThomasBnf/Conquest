import { type Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import { prisma } from "../../prisma";
import { mergeMembers } from "./mergeMembers";

type Props = {
  members: Member[] | undefined;
};

export const batchMergeMembers = async ({ members }: Props) => {
  for (const member of members ?? []) {
    const { primary_email, workspace_id } = member;

    if (!primary_email) continue;

    const membersWithSameEmail = MemberSchema.array().parse(
      await prisma.member.findMany({
        where: {
          primary_email,
          workspace_id,
        },
      }),
    );

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
