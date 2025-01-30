import { client } from "@/lib/rpc";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { useQuery } from "@tanstack/react-query";

type Props = {
  id: string;
};

export const getDiscordMember = ({ id }: Props) => {
  return useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const response = await client.api.members.discord[":discordId"].$get({
        param: {
          discordId: id,
        },
      });
      return MemberSchema.parse(await response.json());
    },
  });
};
