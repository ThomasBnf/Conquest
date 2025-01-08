import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

type Props = {
  from: Date;
  to: Date;
};

export const listActiveMembers = ({ from, to }: Props) => {
  const query = useQuery({
    queryKey: ["active-members", from, to],
    queryFn: async () => {
      const response = await client.api.dashboard["active-members"].$get({
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
    activeMembers: query.data?.active_members,
    activeMembersData: query.data?.membersData,
  };
};
