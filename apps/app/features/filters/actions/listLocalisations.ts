"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@conquest/database";

export const listLocalisations = authAction
  .metadata({
    name: "listLocalisations",
  })
  .action(async ({ ctx: { user } }) => {
    const workspace_id = user.workspace_id;

    const localisations = await prisma.members.groupBy({
      by: ["localisation"],
      where: {
        workspace_id,
        localisation: {
          not: null,
        },
      },
    });

    return localisations.map((l) => l.localisation);
  });
