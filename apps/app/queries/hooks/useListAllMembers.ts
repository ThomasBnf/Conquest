import { client } from "@/lib/rpc";
import { MemberWithCompanySchema } from "@conquest/zod/schemas/member.schema";
import { useInfiniteQuery } from "@tanstack/react-query";

type Props = {
  search: string;
};

export const useListAllMembers = ({ search }: Props) => {
  return useInfiniteQuery({
    queryKey: ["members", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await client.api.members["all-members"].$get({
        query: {
          search,
          page: pageParam.toString(),
        },
      });
      return MemberWithCompanySchema.array().parse(await response.json());
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 50 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};
