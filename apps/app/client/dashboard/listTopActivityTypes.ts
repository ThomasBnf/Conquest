import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

type Props = {
  from: Date;
  to: Date;
};

export const useListTopActivityTypes = ({ from, to }: Props) => {
  return useQuery({
    queryKey: ["top-activity-types", from, to],
    queryFn: async () => {
      const response = await client.api.dashboard["top-activity-types"].$get({
        query: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
      });

      return await response.json();
    },
  });
};
