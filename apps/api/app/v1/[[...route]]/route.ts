import { activities } from "@/server/activities/route";
import { companies } from "@/server/companies/route";
import { members } from "@/server/members/route";
import { prisma } from "@conquest/db/prisma";
import { Hono } from "hono";
import { handle } from "hono/vercel";

type Variables = {
  workspace_id: string;
};

declare module "hono" {
  interface ContextVariableMap extends Variables {}
}

const app = new Hono().basePath("/v1").use(async (c, next) => {
  const authorization = c.req.header("Authorization");
  const hasBearer = authorization?.startsWith("Bearer");
  const token = authorization?.replace("Bearer ", "");

  if (!hasBearer) {
    return c.json(
      { code: "UNAUTHORIZED", message: "Bearer token is required" },
      { status: 401 },
    );
  }

  if (!token) {
    return c.json(
      { code: "UNAUTHORIZED", message: "Missing Access Token" },
      { status: 401 },
    );
  }

  const apiKey = await prisma.apikeys.findUnique({
    where: {
      token,
    },
  });

  if (!apiKey) {
    return c.json(
      { code: "UNAUTHORIZED", message: "Invalid Access Token" },
      { status: 401 },
    );
  }

  c.set("workspace_id", apiKey.workspace_id);

  await next();
});

const api = app
  .route("/members", members)
  .route("/activities", activities)
  .route("/companies", companies);

export const GET = handle(api);
export const POST = handle(api);
export const PATCH = handle(api);
export const DELETE = handle(api);

export type AppType = typeof api;
