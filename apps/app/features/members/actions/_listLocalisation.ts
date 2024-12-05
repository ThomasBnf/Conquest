"use server";

import { MemberSchema } from "@conquest/zod/member.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";

export const _listlocale = authAction
  .metadata({
    name: "_listlocale",
  })
  .action(async ({ ctx }) => {
    const members = await prisma.members.findMany({
      where: {
        workspace_id: ctx.user.workspace_id,
      },
    });

    const parsedMembers = MemberSchema.array().parse(members);

    return parsedMembers.reduce<string[]>((uniquelocales, member) => {
      const locale = member.locale;

      if (locale && !uniquelocales.includes(locale)) {
        uniquelocales.push(locale);
      }
      return uniquelocales;
    }, []);
  });
