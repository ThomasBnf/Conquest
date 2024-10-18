"use server";

import { SignupSchema } from "@conquest/zod/auth.schema";
import { UserSchema } from "@conquest/zod/user.schema";
import { hash } from "bcryptjs";
import { prisma } from "lib/prisma";
import { safeAction } from "lib/safeAction";

export const createUser = safeAction
  .metadata({ name: "createUser" })
  .schema(SignupSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const hashed_password = await hash(password, 10);

    const workspace = await prisma.workspace.create({
      data: {
        name: "",
        slug: "",
      },
    });

    const user = await prisma.user.create({
      data: {
        workspace_id: workspace.id,
        email,
        hashed_password,
      },
    });

    return UserSchema.parse(user);
  });
