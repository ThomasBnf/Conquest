import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

type Props = {
  from: Date;
  to: Date;
};

export const useListNewMembers = ({ from, to }: Props) => {
  const query = useQuery({
    queryKey: ["new-members", from, to],
    queryFn: async () => {
      const response = await client.api.dashboard["new-members"].$get({
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
    newMembers: query.data?.new_members,
    newMembersData: query.data?.membersData,
  };
};
