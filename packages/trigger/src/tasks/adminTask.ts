import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const adminTask = schemaTask({
  id: "admin",
  machine: "small-2x",
  schema: z.object({
    user: UserSchema,
  }),
  run: async ({ user }) => {
    if (user.role !== "STAFF") return;
  },
});
