import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { z } from "zod";

export const deleteListReactions = safeAction
  .metadata({ name: "deleteListReactions" })
  .schema(
    z.object({
      channel_id: z.string(),
      react_to: z.string(),
    }),
  )
  .action(async ({ parsedInput: { channel_id, react_to } }) => {
    return await prisma.activities.deleteMany({
      where: {
        channel_id,
        react_to,
        activity_type: {
          source: "SLACK",
          key: "slack:reaction",
        },
      },
    });
  });
