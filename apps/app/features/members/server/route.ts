import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import ky from "ky";
import { z } from "zod";

const app = new Hono().get(
  "/",
  zValidator(
    "query",
    z.object({
      page: z.coerce.number().min(1).default(1),
      search: z.string().default(""),
      id: z.string().default("last_name"),
      desc: z
        .string()
        .default("false")
        .transform((value) => value === "true"),
    }),
  ),
  async (c) => {
    type ActivityResponse = { hello: string };
    const result = await ky.get("/api/activities").json<ActivityResponse>();
    return c.json(result);
    // Create a new request to the activities endpoint
    // const result = await ky
    //   .get("http://localhost:3000/api/activities")
    //   .json<{ hello: string }>();
    // return c.json(result);
    // const { page, search, id, desc } = c.req.valid("query");
    // const orderBy = getOrderBy(id, desc);
    // const members = await prisma.member.findMany({
    //   where: {
    //     search: search ? { contains: search, mode: "insensitive" } : undefined,
    //     // workspace_id,
    //   },
    //   include: {
    //     activities: true,
    //   },
    //   orderBy,
    //   take: 50,
    //   skip: (page - 1) * 50,
    // });
    // const parsedMembers = MemberWithActivitiesSchema.array().parse(members);
    // if (id === "last_activity") {
    //   return c.json(
    //     parsedMembers.sort((a, b) =>
    //       desc ? sortByLastActivity(a, b) : -sortByLastActivity(a, b),
    //     ),
    //   );
    // }
    // if (id === "created_at") {
    //   return c.json(
    //     parsedMembers.sort((a, b) =>
    //       desc ? sortByCreatedAt(a, b) : -sortByCreatedAt(a, b),
    //     ),
    //   );
    // }
    // return c.json(members);
  },
);

export default app;
