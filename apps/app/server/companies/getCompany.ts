import { prisma } from "@conquest/db/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getCompany = protectedProcedure
  .input(
    z.object({
      id: z.string().cuid().nullable(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id } = input;

    if (!id) return null;

    const company = await prisma.company.findUnique({
      where: {
        id,
        workspace_id,
      },
    });

    if (!company) return null;
    return CompanySchema.parse(company);
  });
