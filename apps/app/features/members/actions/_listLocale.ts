"use server";

import { MemberSchema } from "@conquest/zod/member.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";

export const _listLocale = authAction
  .metadata({
    name: "_listLocale",
  })
  .action(async ({ ctx }) => {
    const members = await prisma.member.findMany({
      where: {
        workspace_id: ctx.user.workspace_id,
      },
    });

    const parsedMembers = MemberSchema.array().parse(members);

    return parsedMembers.reduce<string[]>((uniqueLocales, member) => {
      const locale = member.locale;
      if (locale && !uniqueLocales.includes(locale)) {
        uniqueLocales.push(locale);
      }
      return uniqueLocales;
    }, []);
  });
