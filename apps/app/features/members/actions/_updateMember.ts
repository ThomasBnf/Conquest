"use server";

import { safeAction } from "@/lib/safeAction";
import { MemberSchema } from "@conquest/zod/member.schema";
import { updateMember } from "../functions/updateMember";

export const _updateMember = safeAction
  .metadata({
    name: "_updateMember",
  })
  .schema(MemberSchema.partial())
  .action(async ({ parsedInput }) => {
    const rMember = await updateMember({
      ...parsedInput,
    });

    return MemberSchema.parse(rMember?.data);
  });
