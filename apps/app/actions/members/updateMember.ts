"use server";

import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { MemberSchema } from "@conquest/zod/member.schema";
import { revalidatePath } from "next/cache";

export const updateMember = safeAction
  .metadata({
    name: "updateMember",
  })
  .schema(MemberSchema.partial())
  .action(async ({ parsedInput }) => {
    const member = await prisma.members.update({
      where: {
        id: parsedInput.id,
      },
      data: {
        ...parsedInput,
      },
    });

    revalidatePath(`/members/${member.id}`);
    return MemberSchema.parse(member);
  });
