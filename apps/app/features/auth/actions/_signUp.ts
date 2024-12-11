"use server";

import { SignupSchema } from "@conquest/zod/auth.schema";
import { UserSchema } from "@conquest/zod/user.schema";
import { hash } from "bcryptjs";
import cuid from "cuid";
import { prisma } from "lib/prisma";
import { safeAction } from "lib/safeAction";
import { _logIn } from "./_logIn";

export const _signUp = safeAction
  .metadata({ name: "_signUp" })
  .schema(SignupSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const hashed_password = await hash(password, 10);

    const workspace = await prisma.workspaces.create({
      data: {
        name: "",
        slug: cuid(),
        members_preferences: {
          id: "full_name",
          desc: true,
          pageSize: 25,
          filters: [],
        },
      },
    });

    const user = await prisma.users.create({
      data: {
        workspace_id: workspace.id,
        email,
        hashed_password,
      },
    });

    if (user) await _logIn({ email, password, redirectTo: "/" });

    return UserSchema.parse(user);
  });
