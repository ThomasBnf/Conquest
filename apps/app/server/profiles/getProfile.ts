import { prisma } from "@conquest/db/prisma";
import { ProfileSchema } from "@conquest/zod/schemas/profile.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getProfile = protectedProcedure
  .input(
    z.object({
      external_id: z.string(),
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { external_id } = input;
    const { workspace_id } = user;

    const profile = await prisma.profile.findUnique({
      where: {
        external_id_workspace_id: {
          external_id,
          workspace_id,
        },
      },
    });

    return ProfileSchema.parse(profile);
  });
