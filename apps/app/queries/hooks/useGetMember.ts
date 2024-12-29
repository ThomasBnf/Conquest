import { client } from "@/lib/rpc";
import { MemberSchema } from "@conquest/zod/member.schema";
import { useQuery } from "@tanstack/react-query";

type Props = {
  username: string;
};

export const useGetMember = ({ username }: Props) => {
  return useQuery({
    queryKey: ["member", username],
    queryFn: async () => {
      const response = await client.api.members.discourse[":username"].$get({
        param: {
          username,
        },
      });
      return MemberSchema.parse(await response.json());
    },
  });
};
