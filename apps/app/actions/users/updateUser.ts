"use server";

import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { UserSchema } from "schemas/user.schema";
import { z } from "zod";

export const updateUser = authAction
  .metadata({ name: "updateUser" })
  .schema(
    z.object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      onboarding: z.date().optional(),
      date_range: z
        .object({
          from: z.date().nullable(),
          to: z.date().nullable(),
        })
        .optional(),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const slug = ctx.user?.workspace.slug;
    const { first_name, last_name, onboarding, date_range } = parsedInput;

    const data: {
      first_name?: string;
      last_name?: string;
      full_name?: string;
      onboarding?: Date | null;
      date_range?: {
        from: Date | null;
        to: Date | null;
      };
    } = {
      first_name,
      last_name,
      onboarding,
    };

    if (first_name && last_name) {
      data.full_name = `${first_name} ${last_name}`;
    }
    if (date_range) {
      data.date_range = date_range;
    }

    const user = await prisma.user.update({
      where: {
        id: ctx.user?.id,
      },
      data,
    });

    revalidatePath("/conquest/leaderboard");
    return UserSchema.parse(user);
  });
