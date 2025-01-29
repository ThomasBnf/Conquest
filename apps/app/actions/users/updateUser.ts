"use server";

import { prisma } from "@conquest/db/prisma";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { authAction } from "lib/authAction";
import { revalidatePath } from "next/cache";

export const updateUser = authAction
  .metadata({ name: "updateUser" })
  .schema(UserSchema.partial())
  .action(async ({ ctx: { user }, parsedInput }) => {
    const slug = user?.workspace.slug;

    const updatedUser = await prisma.users.update({
      where: {
        id: user?.id,
      },
      data: parsedInput,
    });

    revalidatePath(`/app/${slug}/settings`);
    return UserSchema.parse(updatedUser);
  });
