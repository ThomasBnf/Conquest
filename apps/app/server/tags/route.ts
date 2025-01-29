import { getAuthUser } from "@/queries/getAuthUser";
import { listTags } from "@conquest/db/queries/tags/listTags";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { Hono } from "hono";

export const tags = new Hono()
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get("/", async (c) => {
    const { workspace_id } = c.get("user");

    const tags = await listTags({ workspace_id });

    return c.json(TagSchema.array().parse(tags));
  });
