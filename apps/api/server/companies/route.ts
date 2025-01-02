import { prisma } from "@/lib/prisma";
import { badRequest, notFound } from "@/lib/utils";
import {
  V1CreateCompanySchema,
  V1UpdateCompanySchema,
} from "@/schemas/company.schema";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { zValidator } from "@hono/zod-validator";
import { Prisma } from "@prisma/client";
import { Hono } from "hono";
import { z } from "zod";

export const companies = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number().min(1).default(1),
        pageSize: z.coerce.number().min(10).max(100).default(10),
      }),
    ),
    async (c) => {
      const { page, pageSize } = c.req.valid("query");
      const workspace_id = c.get("workspace_id");

      try {
        const totalCompanies = await prisma.companies.count({
          where: {
            workspace_id,
          },
        });

        const companies = await prisma.companies.findMany({
          where: {
            workspace_id,
          },
          orderBy: {
            created_at: "desc",
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        });

        return c.json({
          page,
          page_size: pageSize,
          total_companies: totalCompanies,
          companies: CompanySchema.array().parse(companies),
        });
      } catch (error) {
        return badRequest(c, "Failed to fetch companies");
      }
    },
  )
  .post("/", zValidator("json", V1CreateCompanySchema), async (c) => {
    const workspace_id = c.get("workspace_id");
    const company = c.req.valid("json");

    try {
      const createdCompany = await prisma.companies.create({
        data: {
          ...company,
          workspace_id,
        },
      });

      return c.json(CompanySchema.parse(createdCompany));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return badRequest(c, "Company already exists with this name");
        }
      }
      return badRequest(c, "Failed to create company");
    }
  })
  .patch("/:id", zValidator("json", V1UpdateCompanySchema), async (c) => {
    const id = c.req.param("id");
    const workspace_id = c.get("workspace_id");
    const companyData = c.req.valid("json");

    try {
      const updatedCompany = await prisma.companies.update({
        where: {
          id,
          workspace_id,
        },
        data: {
          ...companyData,
        },
      });

      return c.json(CompanySchema.parse(updatedCompany));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return notFound(c, "Company not found");
        }
      }
      return badRequest(c, "Failed to update company");
    }
  })
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string().cuid() })),
    async (c) => {
      const id = c.req.param("id");
      const workspace_id = c.get("workspace_id");

      try {
        await prisma.companies.delete({
          where: {
            id,
            workspace_id,
          },
        });

        return c.json({ message: "Company deleted successfully" });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            return notFound(c, "Company not found");
          }
        }
        return badRequest(c, "Failed to delete company");
      }
    },
  );
