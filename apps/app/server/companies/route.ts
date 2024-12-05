import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { Hono } from "hono";

export const companies = new Hono()
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get("/", async (c) => {
    const { workspace_id } = c.get("user");

    const companies = await prisma.companies.findMany({
      where: { workspace_id },
    });

    return c.json(CompanySchema.array().parse(companies));
  });
