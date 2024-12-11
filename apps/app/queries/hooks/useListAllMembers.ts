import { client } from "@/lib/rpc";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { useQuery } from "@tanstack/react-query";

export const useListAllMembers = () => {
  return useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      const response = await client.api.members["all-members"].$get();
      return MemberSchema.array().parse(await response.json());
    },
  });
};
