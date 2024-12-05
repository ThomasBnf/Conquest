import { getAuthUser } from "@/queries/users/getAuthUser";
import { getWorkflow } from "@/queries/workflows/getWorkflow";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

export const workflows = new Hono()
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        workflow_id: z.string(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { workflow_id } = c.req.valid("query");

      const workflow = await getWorkflow({ id: workflow_id, workspace_id });

      return c.json(workflow);
    },
  );
