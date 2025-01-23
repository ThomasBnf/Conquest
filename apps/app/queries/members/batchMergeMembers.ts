import { prisma } from "@conquest/database";
import {
  type MemberWithCompany,
  MemberWithCompanySchema,
} from "@conquest/zod/schemas/member.schema";
import { mergeMembers } from "./mergeMembers";

type Props = {
  members: MemberWithCompany[];
};

export const batchMergeMembers = async ({ members }: Props) => {
  for (const member of members) {
    const { primary_email, workspace_id } = member;

    const membersWithSameEmail = MemberWithCompanySchema.array().parse(
      await prisma.members.findMany({
        where: {
          primary_email,
          workspace_id,
        },
        include: {
          company: true,
        },
        take: 2,
      }),
    );

    if (membersWithSameEmail.length === 1) continue;

    const [firstMember, secondMember] = membersWithSameEmail;

    const getMemberReference = () => {
      if (firstMember?.first_activity && !secondMember?.first_activity) {
        return firstMember;
      }

      if (!firstMember?.first_activity && secondMember?.first_activity) {
        return secondMember;
      }

      if (firstMember?.first_activity && secondMember?.first_activity) {
        return firstMember.first_activity < secondMember.first_activity
          ? firstMember
          : secondMember;
      }
    };

    const memberReference = getMemberReference();

    const otherMember = membersWithSameEmail.find(
      (m) => m.id !== memberReference?.id,
    );

    if (!memberReference || !otherMember) continue;

    await mergeMembers({
      leftMember: otherMember,
      rightMember: memberReference,
    });
  }
};
