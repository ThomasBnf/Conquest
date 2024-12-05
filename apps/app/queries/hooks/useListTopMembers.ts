import { client } from "@/lib/rpc";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { useQuery } from "@tanstack/react-query";

type Props = {
  from: Date;
  to: Date;
};

export const useListTopMembers = ({ from, to }: Props) => {
  return useQuery({
    queryKey: ["dashboard", "top-members", from, to],
    queryFn: async () => {
      const response = await client.api.dashboard["top-members"].$get({
        query: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
      });
      return MemberSchema.array().parse(await response.json());
    },
  });
};
