import { client } from "@/lib/rpc";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { useQuery } from "@tanstack/react-query";

export const useListMembers = () => {
  return useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const response = await client.api.members.$get();
      return MemberSchema.array().parse(await response.json());
    },
  });
};
