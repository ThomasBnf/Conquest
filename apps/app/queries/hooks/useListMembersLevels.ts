import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

type Props = {
  from: Date;
  to: Date;
};

export const useListMembersLevels = ({ from, to }: Props) => {
  return useQuery({
    queryKey: ["dashboard", "members-levels", from, to],
    queryFn: async () => {
      const response = await client.api.dashboard["members-levels"].$get({
        query: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
      });
      return await response.json();
    },
  });
};
