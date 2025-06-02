import { adminTask as _adminTask } from "@conquest/trigger/tasks/adminTask";
import { protectedProcedure } from "../trpc";

export const adminTask = protectedProcedure.mutation(async ({ ctx }) => {
  const { user } = ctx;

  if (user.role !== "STAFF") return;

  await _adminTask.trigger({ user });
});
