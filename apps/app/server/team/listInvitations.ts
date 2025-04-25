import { prisma } from "@conquest/db/prisma";
import { protectedProcedure } from "../trpc";

export const listInvitations = protectedProcedure.query(async ({ ctx }) => {
  const { user } = ctx;
  const { workspaceId } = user;

  return await prisma.userInvitation.findMany({
    where: {
      workspaceId,
    },
  });
});
