import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

type Props = {
  from: Date;
  to: Date;
};

export const useListTopChannels = ({ from, to }: Props) => {
  return useQuery({
    queryKey: ["top-channels", from, to],
    queryFn: async () => {
      const response = await client.api.dashboard["top-channels"].$get({
        query: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
      });

      return await response.json();
    },
  });
};
