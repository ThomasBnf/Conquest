import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { z } from "zod";

export const deleteReactions = safeAction
  .metadata({
    name: "deleteReactions",
  })
  .schema(
    z.object({
      channel_id: z.string().cuid(),
      ts: z.string(),
    }),
  )
  .action(async ({ parsedInput: { channel_id, ts } }) => {
    return await prisma.activity.deleteMany({
      where: {
        channel_id,
        AND: [
          {
            details: {
              path: ["ts"],
              equals: ts,
            },
          },
          {
            details: {
              path: ["source"],
              equals: "SLACK",
            },
          },
          {
            details: {
              path: ["type"],
              equals: "REACTION",
            },
          },
        ],
      },
    });
  });
