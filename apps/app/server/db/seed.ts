import { seed as seedTask } from "@conquest/trigger/tasks/seed";
import { protectedProcedure } from "../trpc";

export const seed = protectedProcedure.mutation(async ({ ctx }) => {
  const { user } = ctx;

  if (user.role !== "STAFF") return;

  await seedTask.trigger({ user });
});
