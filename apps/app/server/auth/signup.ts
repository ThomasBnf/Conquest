import { LEVELS } from "@/constant";
import { createManyLevels } from "@conquest/clickhouse/levels/createManyLevels";
import { createUser } from "@conquest/clickhouse/users/createUser";
import { getUser } from "@conquest/clickhouse/users/getUser";
import { createWorkspace } from "@conquest/clickhouse/workspaces/createWorkspace";
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
        message: "User already exists",
      });
    }

    const workspace = await createWorkspace({ slug: uuid() });

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
      role: "ADMIN",
      last_seen: new Date(),
      members_preferences: {
        id: "full_name",
        desc: true,
        pageSize: 50,
        groupFilters: { filters: [], operator: "AND" },
        columnVisibility: {},
        columnOrder: [],
      },
      companies_preferences: {
        id: "name",
        desc: true,
        pageSize: 50,
        groupFilters: { filters: [], operator: "AND" },
        columnVisibility: {},
        columnOrder: [],
      },
      workspace_id: workspace.id,
    });

    await caller.login({ email, password });
  });
