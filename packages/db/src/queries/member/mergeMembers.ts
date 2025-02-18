import { type Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import { prisma } from "../../prisma";

type Props = {
  leftMember: Member;
  rightMember: Member;
};

export const mergeMembers = async ({ leftMember, rightMember }: Props) => {
  const isLeftOlder =
    leftMember.first_activity &&
    rightMember.first_activity &&
    leftMember.first_activity < rightMember.first_activity;

  const mergedEntries = Object.entries(leftMember).map(([key, value]) => {
    const rightValue = rightMember[key as keyof typeof rightMember];

    if (!value) {
      return [key, rightValue];
    }

    if (value && !rightValue) {
      return [key, value];
    }

    if (key === "source") {
      return [key, isLeftOlder ? value : rightValue];
    }

    if (key === "tags") {
      const leftTags = value as string[];
      const rightTags = rightValue as string[];

      return [key, [...leftTags, ...rightTags]];
    }

    if (key === "secondary_emails") {
      const leftSecondaryEmails = value as string[];
      const rightSecondaryEmails = rightValue as string[];

      return [key, [...leftSecondaryEmails, ...rightSecondaryEmails]];
    }

    if (key === "phones") {
      const leftPhones = value as string[];
      const rightPhones = rightValue as string[];

      return [key, [...leftPhones, ...rightPhones]];
    }

    if (key === "created_at") {
      return [key, isLeftOlder ? value : rightValue];
    }

    return [key, rightValue];
  });

  const mergedMember = {
    ...Object.fromEntries(mergedEntries),
  };

  const { id, company_name, company, workspace_id, ...memberData } =
    mergedMember;

  const updatedMember = await prisma.$transaction(async (tx) => {
    await tx.activity.updateMany({
      where: {
        member_id: leftMember.id,
        workspace_id,
      },
      data: {
        member_id: mergedMember.id,
      },
    });

    await tx.activity.updateMany({
      where: {
        invite_to: leftMember.id,
        workspace_id,
      },
      data: {
        invite_to: mergedMember.id,
      },
    });

    await tx.member.delete({
      where: {
        id: leftMember.id,
        workspace_id,
      },
    });

    const member = await tx.member.update({
      where: {
        id: mergedMember.id,
        workspace_id,
      },
      data: {
        ...memberData,
        logs: [],
        workspace_id,
      },
    });

    return MemberSchema.parse(member);
  });

  // await refreshMemberMetrics.trigger({ member: updatedMember });

  return MemberSchema.parse(updatedMember);
};
