import { env } from "@/env.mjs";
import { prisma } from "@/lib/prisma";
import type { getAuthUser } from "@/queries/users/getAuthUser";
import { activities } from "@/server/activities/route";
import { activityTypes } from "@/server/activity-types/route";
import { companies } from "@/server/companies/route";
import { dashboard } from "@/server/dashboard/route";
import { files } from "@/server/files/route";
import { leaderboard } from "@/server/leaderboard/route";
import { members } from "@/server/members/route";
import { slack } from "@/server/slack/route";
import { tags } from "@/server/tags/route";
import { workflows } from "@/server/workflows/route";
import type { Provider } from "@auth/core/providers";
import CredentialsProvider from "@auth/core/providers/credentials";
import { LoginSchema } from "@conquest/zod/schemas/auth.schema";
import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { authHandler, initAuthConfig } from "@hono/auth-js";
import { compare } from "bcryptjs";
import { Hono } from "hono";
import { handle } from "hono/vercel";

type Variables = {
  user: Awaited<ReturnType<typeof getAuthUser>>;
};

declare module "hono" {
  interface ContextVariableMap extends Variables {}
}

const app = new Hono().basePath("/api").use(
  "*",
  initAuthConfig(() => ({
    secret: env.AUTH_SECRET,
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        authorize: async (credentials) => {
          const validatedFields = LoginSchema.safeParse(credentials);

          if (validatedFields.success) {
            const { email, password } = validatedFields.data;

            const user = await prisma.users.findUnique({
              where: { email },
            });

            if (!user || !user.hashed_password) return null;

            const passwordsMatch = await compare(
              password,
              user.hashed_password,
            );

            if (passwordsMatch) return UserSchema.parse(user);
          }

          return null;
        },
      }) as Provider,
    ],
  })),
);

app.use("/auth/*", authHandler());

app.get("/auth/session", async (c) => {
  const session = c.get("authUser");
  if (session) {
    return c.json({ user: session.user, ...session });
  }
  return c.json({ error: "No session found" }, 401);
});

const api = app
  .route("/activities", activities)
  .route("/activityTypes", activityTypes)
  .route("/companies", companies)
  .route("/dashboard", dashboard)
  .route("/files", files)
  .route("/leaderboard", leaderboard)
  .route("/members", members)
  .route("/slack", slack)
  .route("/tags", tags)
  .route("/workflows", workflows);

export const GET = handle(api);
export const POST = handle(api);
export const PATCH = handle(api);

export type AppType = typeof api;
