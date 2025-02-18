import { prisma } from "@conquest/db/prisma";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateCompany = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: CompanySchema.partial(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id, data } = input;
    const { tags } = data;

    const company = await prisma.company.update({
      where: {
        id,
        workspace_id,
      },
      data: {
        ...data,
        tags: tags ? { set: tags } : undefined,
      },
    });

    return CompanySchema.parse(company);
  });
