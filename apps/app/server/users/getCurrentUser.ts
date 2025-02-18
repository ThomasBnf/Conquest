import { protectedProcedure } from "../trpc";

export const getCurrentUser = protectedProcedure.query(async ({ ctx }) => {
  return ctx.user;
});
