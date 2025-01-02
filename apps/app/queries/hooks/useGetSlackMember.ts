import { client } from "@/lib/rpc";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { useQuery } from "@tanstack/react-query";

type Props = {
  id: string;
};

export const useGetSlackMember = ({ id }: Props) => {
  return useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const response = await client.api.members.slack[":slackId"].$get({
        param: {
          slackId: id,
        },
      });
      return MemberSchema.parse(await response.json());
    },
  });
};
