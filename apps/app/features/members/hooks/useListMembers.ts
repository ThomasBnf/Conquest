import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import type { Filter } from "@conquest/zod/filters.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { _listMembers } from "../actions/_listMembers";

type Props = {
  debouncedSearch: string;
  id: string;
  desc: boolean;
  filters: Filter[];
};

export const useListMembers = ({
  debouncedSearch,
  id,
  desc,
  filters,
}: Props) => {
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["members", debouncedSearch, id, desc, filters],
    queryFn: async ({ pageParam }) => {
      const rMembers = await _listMembers({
        page: pageParam,
        search: debouncedSearch,
        id,
        desc,
        filters,
      });
      return rMembers?.data;
    },
    getNextPageParam: (_, allPages) => {
      const PAGE_SIZE = 50;
      const lastPage = allPages[allPages.length - 1];
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 0,
  });

  const members = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];
    return z.array(MemberWithActivitiesSchema).parse(pages.flat());
  }, [data?.pages]);

  return { members, isLoading, fetchNextPage, hasNextPage };
};
