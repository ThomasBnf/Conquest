import { UserSchema } from "@conquest/zod/schemas/user.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { checkSlackProfiles } from "../admin/checkSlackProfiles";
import { updateProfiles } from "../admin/updateProfiles";

export const adminTask = schemaTask({
  id: "admin",
  machine: "small-2x",
  schema: z.object({
    user: UserSchema,
  }),
  run: async ({ user }) => {
    if (user.role !== "STAFF") return;

    await updateProfiles();
    await checkSlackProfiles();
  },
});
