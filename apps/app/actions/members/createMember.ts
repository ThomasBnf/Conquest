"use server";

import { MemberSchema } from "@conquest/zod/member.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createMember = authAction
  .metadata({ name: "createMember" })
  .schema(
    z.object({
      first_name: z.string(),
      last_name: z.string(),
      email: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { first_name, last_name, email } }) => {
    const member = await prisma.member.create({
      data: {
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
        emails: [email],
        source: "MANUAL",
        search: `${first_name} ${last_name} ${email}`.trim().toLowerCase(),
        workspace_id: ctx.user.workspace_id,
      },
    });

    revalidatePath(`/${ctx.user.workspace.slug}/members`);
    return MemberSchema.parse(member);
  });
