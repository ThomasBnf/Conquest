"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@conquest/db/prisma";
import { z } from "zod";

export const deleteManyMembers = authAction
  .metadata({
    name: "deleteManyMembers",
  })
  .schema(
    z.object({
      ids: z.array(z.string()),
    }),
  )
  .action(async ({ ctx, parsedInput: { ids } }) => {
    return await prisma.members.deleteMany({
      where: {
        id: {
          in: ids,
        },
        workspace_id: ctx.user.workspace_id,
      },
    });
  });
