"use server";

import { safeAction } from "@/lib/safeAction";
import { MemberSchema } from "@conquest/zod/member.schema";
import { updateMember } from "../functions/updateMember";
import { updateMemberSchema } from "../schema/update-member.schema";

export const _updateMember = safeAction
  .metadata({
    name: "_updateMember",
  })
  .schema(updateMemberSchema)
  .action(async ({ parsedInput }) => {
    const rMember = await updateMember({
      ...parsedInput,
    });

    return MemberSchema.parse(rMember?.data);
  });
