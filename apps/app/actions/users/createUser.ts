"use server";

import { hash } from "bcryptjs";
import { endOfDay, startOfDay, subDays } from "date-fns";
import { prisma } from "lib/prisma";
import { safeAction } from "lib/safeAction";
import { SignupSchema } from "schemas/auth.schema";
import { UserSchema } from "schemas/user.schema";

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
        date_range: {
          from: subDays(startOfDay(new Date()), 30),
          to: endOfDay(new Date()),
        },
      },
    });

    return UserSchema.parse(user);
  });
