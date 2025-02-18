import { LEVELS } from "@/constant";
import { prisma } from "@conquest/db/prisma";
import { SignupSchema } from "@conquest/zod/schemas/auth.schema";
import { hash } from "bcryptjs";
import cuid from "cuid";
import { cookies } from "next/headers";
import { publicProcedure } from "../trpc";
import { caller } from "./router";

export const signup = publicProcedure
  .input(SignupSchema)
  .mutation(async ({ input }) => {
    const { email, password } = input;

    const cookieStore = cookies();
    cookieStore.set("sidebar:state", "true");

    const hashed_password = await hash(password, 10);

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) return;

    const workspace = await prisma.workspace.create({
      data: {
        name: "",
        slug: cuid(),
      },
    });

    await prisma.level.createMany({
      data: LEVELS.map((level) => ({
        ...level,
        workspace_id: workspace.id,
      })),
    });

    await prisma.user.create({
      data: {
        email,
        hashed_password,
        workspace_id: workspace.id,
      },
      omit: {
        hashed_password: true,
      },
    });

    await caller.login({ email, password });
  });
