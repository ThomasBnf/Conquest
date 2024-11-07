import {
  type MemberWithActivities,
  MemberWithActivitiesSchema,
} from "@conquest/zod/activity.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { _listLeaderboard } from "../actions/_listLeaderboard";

type Props = {
  initialMembers: MemberWithActivities[] | undefined;
  from: Date;
  to: Date;
};

export const useListLeaderboard = ({ initialMembers, from, to }: Props) => {
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["leaderboard", from, to],
    queryFn: async ({ pageParam }) => {
      const rLeaderboard = await _listLeaderboard({
        page: pageParam,
        from,
        to,
      });
      return rLeaderboard?.data;
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
