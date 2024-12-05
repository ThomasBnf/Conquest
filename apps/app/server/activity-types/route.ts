import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { Hono } from "hono";

export const activityTypes = new Hono()
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get("/", async (c) => {
    const { workspace_id } = c.get("user");

    const activityTypes = await prisma.activities_types.findMany({
      where: {
        workspace_id,
      },
    });

    return c.json(ActivityTypeSchema.array().parse(activityTypes));
  })
  .get("/sources", async (c) => {
    const { workspace_id } = c.get("user");

    const activityTypes = await prisma.activities_types.groupBy({
      by: ["source"],
      where: {
        workspace_id,
      },
    });

    const sources = activityTypes.map((activityType) => activityType.source);

    return c.json(sources);
  });
