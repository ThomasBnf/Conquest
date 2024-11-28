import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { z } from "zod";

export const deleteActivity = safeAction
  .metadata({
    name: "deleteActivity",
  })
  .schema(
    z.object({
      id: z.string().optional(),
      external_id: z.string().optional(),
      channel_id: z.string().optional(),
      workspace_id: z.string(),
    }),
  )
  .action(
    async ({ parsedInput: { id, channel_id, external_id, workspace_id } }) => {
      if (!id) {
        return await prisma.activities.deleteMany({
          where: {
            external_id,
            channel_id,
            workspace_id,
          },
        });
      }

      return await prisma.activities.delete({
        where: { id },
      });
    },
  );
