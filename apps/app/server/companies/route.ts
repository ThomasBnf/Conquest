import { getAuthUser } from "@/queries/getAuthUser";
import { orderByParser } from "@conquest/db/helpers/orderByParser";
import { prisma } from "@conquest/db/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { zValidator } from "@hono/zod-validator";
import { Prisma } from "@prisma/client";
import { Hono } from "hono";
import { z } from "zod";

export const companies = new Hono()
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
        search: z.string(),
        id: z.string(),
        desc: z.string().transform((val) => val === "true"),
        page: z.coerce.number(),
        pageSize: z.coerce.number(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { search, id, desc, page, pageSize } = c.req.valid("query");

      const searchParsed = search.toLowerCase().trim();
      const orderBy = orderByParser({ id, desc, type: "companies" });

      const companies = await prisma.$queryRaw`
        SELECT 
          c.*
        FROM companies c
        WHERE 
          LOWER(c.name) LIKE '%' || ${searchParsed} || '%'
          AND c.workspace_id = ${workspace_id}
        ${Prisma.sql([orderBy])}
        LIMIT ${pageSize}
        OFFSET ${(page - 1) * pageSize}
      `;

      return c.json(CompanySchema.array().parse(companies));
    },
  )
  .get(
    "/count",
    zValidator(
      "query",
      z.object({
        search: z.string(),
      }),
    ),
    async (c) => {
      const { workspace_id } = c.get("user");
      const { search } = c.req.valid("query");

      const searchParsed = search?.toLowerCase().trim();

      const [{ count }] = await prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(DISTINCT c.id)::bigint as count
          FROM companies c
          WHERE 
            LOWER(c.name) LIKE '%' || ${searchParsed} || '%'
            AND c.workspace_id = ${workspace_id}
        `;

      return c.json(Number(count));
    },
  );
