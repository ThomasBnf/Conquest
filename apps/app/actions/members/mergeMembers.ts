"use server";

import { authAction } from "@/lib/authAction";
import { mergeMembers as _mergeMembers } from "@/queries/members/mergeMembers";
import { MemberWithCompanySchema } from "@conquest/zod/schemas/member.schema";
import { z } from "zod";

export const mergeMembers = authAction
  .metadata({
    name: "mergeMembers",
  })
  .schema(
    z.object({
      leftMember: MemberWithCompanySchema,
      rightMember: MemberWithCompanySchema,
    }),
  )
  .action(async ({ parsedInput: { leftMember, rightMember } }) => {
    const mergedMember = await _mergeMembers({
      leftMember,
      rightMember,
    });

    return mergedMember;
  });
