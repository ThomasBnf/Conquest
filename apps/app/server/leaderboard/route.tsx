import { listLeaderboard } from "@/queries/leaderboard/listLeaderboard";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

export const leaderboard = new Hono()
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
        from: z.coerce.date(),
        to: z.coerce.date(),
        page: z.coerce.number(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { from, to, page } = c.req.valid("query");

      const members = await listLeaderboard({
        from,
        to,
        workspace_id,
        page,
      });

      return c.json(MemberSchema.array().parse(members));
    },
  );
