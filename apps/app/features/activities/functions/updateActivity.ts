import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { z } from "zod";

export const updateActivity = safeAction
  .metadata({ name: "updateActivity" })
  .schema(
    z.object({
      external_id: z.string(),
      message: z.string(),
      activity_type_id: z.string(),
      // files: _files,
      reply_to: z.string().optional(),
    }),
  )
  .action(
    async ({
      parsedInput: { external_id, message, activity_type_id, reply_to },
    }) => {
      return await prisma.activities.update({
        where: {
          external_id,
        },
        data: {
          message,
          activity_type: {
            connect: {
              id: activity_type_id,
            },
          },
          reply_to,
        },
      });
    },
  );
