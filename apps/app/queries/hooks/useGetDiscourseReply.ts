import { client } from "@/lib/rpc";
import { ActivityWithMemberSchema } from "@conquest/zod/schemas/activity.schema";
import { useQuery } from "@tanstack/react-query";

type Props = {
  reply_to: string | null;
  thread_id: string | null;
};

export const useGetDiscourseReply = ({ reply_to, thread_id }: Props) => {
  return useQuery({
    queryKey: ["activity", reply_to],
    queryFn: async () => {
      if (!reply_to) return null;
      const response = await client.api.activities.discourse[
        ":postNumber"
      ].$get({
        param: {
          postNumber: reply_to,
        },
        query: {
          thread_id: thread_id ?? "",
        },
      });
      return ActivityWithMemberSchema.parse(await response.json());
    },
  });
};
