import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { Hono } from "hono";

export const github = new Hono()
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get("/", async (c) => {
    const { workspace_id } = c.get("user");

    const github = GithubIntegrationSchema.parse(
      await prisma.integrations.findFirst({
        where: {
          workspace_id,
          details: {
            path: ["source"],
            equals: "GITHUB",
          },
        },
      }),
    );

    const { access_token } = github.details;

    const response = await fetch("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    return c.json(await response.json());
  });
