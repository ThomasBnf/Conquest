import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { Hono } from "hono";

export const channels = new Hono()
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get("/", async (c) => {
    const { workspace_id } = c.get("user");

    const channels = await prisma.channels.findMany({
      where: {
        workspace_id,
      },
    });

    return c.json(ChannelSchema.array().parse(channels));
  });
