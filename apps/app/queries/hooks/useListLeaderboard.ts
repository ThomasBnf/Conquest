import { client } from "@/lib/rpc";
import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { type Member, MemberSchema } from "@conquest/zod/schemas/member.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type Props = {
  initialMembers: Member[] | undefined;
  from: Date;
  to: Date;
};

export const useListLeaderboard = ({ initialMembers, from, to }: Props) => {
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["leaderboard", from, to],
    queryFn: async ({ pageParam }) => {
      const response = await client.api.leaderboard.$get({
        query: {
          from: from.toISOString(),
          to: to.toISOString(),
          page: pageParam.toString(),
        },
      });

      return MemberSchema.array().parse(await response.json());
    },
    getNextPageParam: (_, allPages) => allPages.length + 1,
    initialPageParam: 1,
    initialData: { pages: [initialMembers], pageParams: [1] },
  });

  const members = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];
    return MemberWithActivitiesSchema.array().parse(pages.flat()).slice(3);
  }, [data?.pages]);

  return { members, isLoading, fetchNextPage, hasNextPage };
};
