import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { z } from "zod";

export const deleteActivity = safeAction
  .metadata({ name: "deleteActivity" })
  .schema(
    z.object({
      channel_id: z.string(),
      message: z.string().optional(),
      ts: z.string(),
    }),
  )
  .action(async ({ parsedInput: { channel_id, message, ts } }) => {
    const AND = message
      ? [
          {
            details: {
              path: ["ts"],
              equals: ts,
            },
          },
          {
            details: {
              path: ["message"],
              equals: message,
            },
          },
        ]
      : [
          {
            details: {
              path: ["ts"],
              equals: ts,
            },
          },
        ];

    return await prisma.activity.deleteMany({
      where: {
        channel_id,
        AND,
      },
    });
  });
