"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { updateMemberMetrics } from "@/trigger/updateMemberMetrics";
import {
  MemberSchema,
  MemberWithCompanySchema,
} from "@conquest/zod/schemas/member.schema";
import { z } from "zod";

export const mergeMember = authAction
  .metadata({
    name: "mergeMember",
  })
  .schema(
    z.object({
      leftMember: MemberWithCompanySchema,
      rightMember: MemberWithCompanySchema,
    }),
  )
  .action(
    async ({ ctx: { user }, parsedInput: { leftMember, rightMember } }) => {
      const isLeftOlder = leftMember.created_at < rightMember.created_at;

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

        if (key === "logs") {
          return [key, []];
        }

        if (key === "created_at") {
          return [key, isLeftOlder ? value : rightValue];
        }

        return [key, rightValue];
      });

      const mergedMember = {
        ...Object.fromEntries(mergedEntries),
      };

      const { id, company_id, company_name, workspace_id, ...memberData } =
        mergedMember;

      const updatedMember = await prisma.$transaction(async (tx) => {
        await tx.activities.updateMany({
          where: {
            member_id: leftMember.id,
            workspace_id: user.workspace_id,
          },
          data: {
            member_id: mergedMember.id,
          },
        });

        await tx.activities.updateMany({
          where: {
            invite_to: leftMember.id,
            workspace_id: user.workspace_id,
          },
          data: {
            invite_to: mergedMember.id,
          },
        });

        await tx.members.delete({
          where: {
            id: leftMember.id,
            workspace_id: user.workspace_id,
          },
        });

        const member = await tx.members.update({
          where: {
            id: mergedMember.id,
            workspace_id: user.workspace_id,
          },
          data: {
            ...memberData,
            workspace_id: user.workspace_id,
            company_id,
          },
        });

        return MemberSchema.parse(member);
      });

      await updateMemberMetrics.trigger({ member: updatedMember });

      return updatedMember;
    },
  );
