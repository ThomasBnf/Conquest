import {
  type MemberWithActivities,
  MemberWithActivitiesSchema,
} from "@conquest/zod/activity.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { _listMembers } from "../actions/_listMembers";

type Props = {
  initialMembers: MemberWithActivities[] | undefined;
  debouncedSearch: string;
  id: string;
  desc: boolean;
};

export const useListMembers = ({
  initialMembers,
  debouncedSearch,
  id,
  desc,
}: Props) => {
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["members", debouncedSearch, id, desc],
    queryFn: async ({ pageParam }) => {
      const rMembers = await _listMembers({
        page: pageParam,
        search: debouncedSearch,
        id,
        desc,
      });
      return rMembers?.data;
    },
    getNextPageParam: (_, allPages) => allPages.length + 1,
    placeholderData: (previousData) => {
      if (!previousData) {
        return {
          pages: [initialMembers],
          pageParams: [1],
        };
      }
      return previousData;
    },
    initialPageParam: 1,
  });

  const members = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];
    return z.array(MemberWithActivitiesSchema).parse(pages.flat());
  }, [data?.pages]);

  return { members, isLoading, fetchNextPage, hasNextPage };
};
