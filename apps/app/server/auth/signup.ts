import { LEVELS } from "@/constant";
import { createManyLevels } from "@conquest/clickhouse/levels/createManyLevels";
import { createUser } from "@conquest/db/users/createUser";
import { getUser } from "@conquest/db/users/getUser";
import { createWorkspace } from "@conquest/db/workspaces/createWorkspace";
import { SignupSchema } from "@conquest/zod/schemas/auth.schema";
import { TRPCError } from "@trpc/server";
import { hash } from "bcryptjs";
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";
import { publicProcedure } from "../trpc";
import { caller } from "./router";

export const signup = publicProcedure
  .input(SignupSchema)
  .mutation(async ({ input }) => {
    const { email, password } = input;

    const cookieStore = cookies();
    cookieStore.set("sidebar:state", "true");

    const existingUser = await getUser({ email });

    if (existingUser) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Invalid signup request",
      });
    }

    const workspace = await createWorkspace({ name: "", slug: uuid() });

    if (!workspace) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create workspace",
      });
    }

    await createManyLevels({
      levels: LEVELS,
      workspace_id: workspace.id,
    });

    const hashed_password = await hash(password, 10);

    await createUser({
      email,
      hashed_password,
      workspace_id: workspace.id,
    });

    await caller.login({ email, password });
  });
