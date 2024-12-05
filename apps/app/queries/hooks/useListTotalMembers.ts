import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

type Props = {
  from: Date;
  to: Date;
};

export const useListTotalMembers = ({ from, to }: Props) => {
  const query = useQuery({
    queryKey: ["total-members", from, to],
    queryFn: async () => {
      const response = await client.api.dashboard["total-members"].$get({
        query: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
      });

      return await response.json();
    },
  });

  return {
    ...query,
    totalMembers: query.data?.total_members,
    totalMembersData: query.data?.membersData,
  };
};
