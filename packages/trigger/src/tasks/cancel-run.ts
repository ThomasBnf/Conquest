import { runs, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const cancelRun = schemaTask({
  id: "cancelRun",
  schema: z.object({
    id: z.string(),
  }),
  run: async ({ id }) => {
    runs.cancel(id);
  },
});
