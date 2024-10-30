import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { z } from "zod";

export const updateMember = safeAction
  .metadata({ name: "updateMember" })
  .schema(
    z.object({
      slack_id: z.string(),
      left_at: z.string(),
    }),
  )
  .action(async ({ parsedInput: { slack_id, left_at } }) => {
    return await prisma.member.update({
      where: {
        slack_id,
      },
      data: {
        left_at: new Date(Number(left_at) * 1000),
      },
    });
  });
