import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { prisma } from "../../prisma";
import { getMember } from "./getMember";
import { mergeMembers } from "./mergeMembers";

type Props = {
  member_id: string;
};

export const checkMerging = async ({ member_id }: Props) => {
  const member = await getMember({ id: member_id });

  const { primary_email, workspace_id } = member ?? {};

  const membersWithSameEmail = MemberSchema.array().parse(
    await prisma.member.findMany({
      where: {
        primary_email,
        workspace_id,
      },

      orderBy: {
        created_at: "desc",
      },
      take: 2,
    }),
  );

  if (membersWithSameEmail.length === 1) return member;

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

    return firstMember;
  };

  const memberReference = getMemberReference();

  const otherMember = membersWithSameEmail.find(
    (m) => m.id !== memberReference?.id,
  );

  if (!memberReference || !otherMember) return;

  const mergedMember = await mergeMembers({
    leftMember: otherMember,
    rightMember: memberReference,
  });

  return mergedMember;
};
