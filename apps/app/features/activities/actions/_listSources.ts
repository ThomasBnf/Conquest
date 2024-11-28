"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";

export const _listSources = authAction
  .metadata({
    name: "_listSources",
  })
  .action(async ({ ctx }) => {
    const sources = await prisma.activities_types.groupBy({
      by: ["source"],
      where: {
        workspace_id: ctx.user.workspace_id,
      },
    });

    return sources.map(({ source }) => source);
  });
