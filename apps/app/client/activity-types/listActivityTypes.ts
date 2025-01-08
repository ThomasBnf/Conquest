import { client } from "@/lib/rpc";
import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import { useQuery } from "@tanstack/react-query";

export const listActivityTypes = () => {
  return useQuery({
    queryKey: ["activityTypes"],
    queryFn: async () => {
      const response = await client.api.activityTypes.$get();
      return ActivityTypeSchema.array().parse(await response.json());
    },
  });
};
