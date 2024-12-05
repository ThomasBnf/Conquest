import { getActivity } from "@/queries/activities/getActivity";
import { listActivities } from "@/queries/activities/listActivities";
import { listCompanyActivities } from "@/queries/activities/listCompanyActivities";
import { listMemberActivities } from "@/queries/activities/listMemberActivities";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { ActivityWithTypeAndMemberSchema } from "@conquest/zod/schemas/activity.schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

export const activities = new Hono()
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get(
    "/",
    zValidator("query", z.object({ page: z.coerce.number() })),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { page } = c.req.valid("query");

      const activities = await listActivities({
        page,
        workspace_id,
      });

      return c.json(ActivityWithTypeAndMemberSchema.array().parse(activities));
    },
  )
  .get("/:activityId", async (c) => {
    const { workspace_id } = c.get("user");
    const { activityId } = c.req.param();

    const activity = await getActivity({
      external_id: activityId,
      workspace_id,
    });

    return c.json(activity);
  })
  .get(
    "/member/:memberId",
    zValidator("query", z.object({ page: z.coerce.number() })),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { memberId } = c.req.param();
      const { page } = c.req.valid("query");

      const activities = await listMemberActivities({
        member_id: memberId,
        workspace_id,
        page: page,
      });

      return c.json(ActivityWithTypeAndMemberSchema.array().parse(activities));
    },
  )
  .get(
    "/company/:companyId",
    zValidator("query", z.object({ page: z.coerce.number() })),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { companyId } = c.req.param();
      const { page } = c.req.valid("query");

      const activities = await listCompanyActivities({
        company_id: companyId,
        workspace_id,
        page: page,
      });

      return c.json(ActivityWithTypeAndMemberSchema.array().parse(activities));
    },
  );
