"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";

export const _listKeys = authAction
  .metadata({
    name: "_listKeys",
  })
  .action(async ({ ctx }) => {
    const types = await prisma.activities_types.groupBy({
      by: ["key"],
      where: {
        workspace_id: ctx.user.workspace_id,
      },
    });

    return types.map(({ key }) => key);
  });
