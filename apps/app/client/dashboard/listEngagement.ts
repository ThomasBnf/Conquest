import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

type Props = {
  from: Date;
  to: Date;
};

export const listEngagement = ({ from, to }: Props) => {
  return useQuery({
    queryKey: ["engagement", from, to],
    queryFn: async () => {
      const response = await client.api.dashboard.engagement.$get({
        query: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
      });
      return await response.json();
    },
  });
};
