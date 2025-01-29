"use server";

import { safeAction } from "@/lib/safeAction";
import { prisma } from "@conquest/db/prisma";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateMember = safeAction
  .metadata({
    name: "updateMember",
  })
  .schema(
    z.object({
      id: z.string(),
      data: MemberSchema.partial(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { id, data } = parsedInput;

    const member = await prisma.members.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });

    revalidatePath(`/members/${member.id}`);
    return MemberSchema.parse(member);
  });
