import { client } from "@/lib/rpc";
import { ActivityWithMemberSchema } from "@conquest/zod/schemas/activity.schema";
import { useQuery } from "@tanstack/react-query";

type Props = {
  id: string | null;
};

export const useGetActivity = ({ id }: Props) => {
  return useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await client.api.activities[":activityId"].$get({
        param: {
          activityId: id,
        },
      });
      return ActivityWithMemberSchema.parse(await response.json());
    },
  });
};
