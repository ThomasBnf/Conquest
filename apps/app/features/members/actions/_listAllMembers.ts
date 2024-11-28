"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { MemberSchema } from "@conquest/zod/member.schema";

export const _listAllMembers = authAction
  .metadata({ name: "_listAllMembers" })
  .action(async ({ ctx: { user } }) => {
    const workspace_id = user.workspace_id;

    const members = await prisma.members.findMany({
      where: { workspace_id },
    });

    return MemberSchema.array().parse(members);
  });
