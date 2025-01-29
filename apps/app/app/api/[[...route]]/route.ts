import type { getAuthUser } from "@/queries/getAuthUser";
import { activities } from "@/server/activities/route";
import { activityTypes } from "@/server/activity-types/route";
import { channels } from "@/server/channels/route";
import { companies } from "@/server/companies/route";
import { dashboard } from "@/server/dashboard/route";
import { discord } from "@/server/discord/route";
import { discourse } from "@/server/discourse/route";
import { files } from "@/server/files/route";
import { github } from "@/server/github/route";
import { linkedin } from "@/server/linkedin/route";
import { livestorm } from "@/server/livestorm/route";
import { members } from "@/server/members/route";
import { slack } from "@/server/slack/route";
import { tags } from "@/server/tags/route";
import { workflows } from "@/server/workflows/route";
import { Hono } from "hono";
import { handle } from "hono/vercel";

type Variables = {
  user: Awaited<ReturnType<typeof getAuthUser>>;
};

declare module "hono" {
  interface ContextVariableMap extends Variables {}
}

const app = new Hono().basePath("/api");

const api = app
  .route("/activities", activities)
  .route("/activityTypes", activityTypes)
  .route("/channels", channels)
  .route("/companies", companies)
  .route("/dashboard", dashboard)
  .route("/discord", discord)
  .route("/discourse", discourse)
  .route("/files", files)
  .route("/github", github)
  .route("/linkedin", linkedin)
  .route("/livestorm", livestorm)
  .route("/members", members)
  .route("/slack", slack)
  .route("/tags", tags)
  .route("/workflows", workflows);

export const GET = handle(api);
export const POST = handle(api);
export const PATCH = handle(api);

export type AppType = typeof api;
