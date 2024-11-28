"use server";

import { MemberSchema } from "@conquest/zod/member.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";

export const _listLocalisation = authAction
  .metadata({
    name: "_listLocalisation",
  })
  .action(async ({ ctx }) => {
    const members = await prisma.members.findMany({
      where: {
        workspace_id: ctx.user.workspace_id,
      },
    });

    const parsedMembers = MemberSchema.array().parse(members);

    return parsedMembers.reduce<string[]>((uniqueLocalisations, member) => {
      const localisation = member.localisation;
      console.log("localisation", localisation);

      if (localisation && !uniqueLocalisations.includes(localisation)) {
        uniqueLocalisations.push(localisation);
      }
      return uniqueLocalisations;
    }, []);
  });
