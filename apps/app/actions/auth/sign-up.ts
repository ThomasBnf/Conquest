"use server";

import { prisma } from "@conquest/db/prisma";
import { SignupSchema } from "@conquest/zod/schemas/auth.schema";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { hash } from "bcryptjs";
import cuid from "cuid";
import { safeAction } from "lib/safeAction";
import { cookies } from "next/headers";
import { logIn } from "./log-in";

export const signUp = safeAction
  .metadata({ name: "signUp" })
  .schema(SignupSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const cookieStore = cookies();
    const hashed_password = await hash(password, 10);

    cookieStore.set("sidebar:state", "true");

    const existingUser = await prisma.users.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) return;

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
        email,
        hashed_password,
        workspace_id: workspace.id,
      },
    });

    await logIn({ email, password, redirectTo: "/" });

    return UserSchema.parse(user);
  });
