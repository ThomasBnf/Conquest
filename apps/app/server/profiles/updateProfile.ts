import { prisma } from "@conquest/db/prisma";
import { ProfileAttributesSchema } from "@conquest/zod/schemas/profile.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateProfile = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      attributes: ProfileAttributesSchema,
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { id, attributes } = input;

    await prisma.profile.update({
      where: {
        id,
        workspace_id,
      },
      data: {
        attributes,
      },
    });
  });
