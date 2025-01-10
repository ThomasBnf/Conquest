"use server";

import { SignupSchema } from "@conquest/zod/schemas/auth.schema";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { hash } from "bcryptjs";
import cuid from "cuid";
import { prisma } from "lib/prisma";
import { safeAction } from "lib/safeAction";
import { logIn } from "./logIn";

export const signUp = safeAction
  .metadata({ name: "signUp" })
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
          pageSize: 50,
          filters: [],
        },
        plan: "BASIC",
      },
    });

    const user = await prisma.users.create({
      data: {
        workspace_id: workspace.id,
        email,
        hashed_password,
      },
    });

    if (user) await logIn({ email, password, redirectTo: "/" });

    return UserSchema.parse(user);
  });
