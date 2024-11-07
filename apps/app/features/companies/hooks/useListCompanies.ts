import { type Company, CompanySchema } from "@conquest/zod/company.schema";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { _listCompanies } from "../actions/_listCompanies";

type Props = {
  initialCompanies: Company[] | undefined;
  debouncedSearch: string;
  id: string;
  desc: boolean;
};

export const useListCompanies = ({
  initialCompanies,
  debouncedSearch,
  id,
  desc,
}: Props) => {
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["companies", debouncedSearch, id, desc],
    queryFn: async ({ pageParam }) => {
      const rCompanies = await _listCompanies({
        name: debouncedSearch,
        page: pageParam,
        id,
        desc,
      });
      return rCompanies?.data;
    },
    getNextPageParam: (_, allPages) => allPages.length + 1,
    placeholderData: (previousData) => {
      if (!previousData) {
        return {
          pages: [initialCompanies],
          pageParams: [1],
        };
      }
      return previousData;
    },
    initialPageParam: 1,
  });

  const companies = useMemo(() => {
    const pages = data?.pages;
    if (!pages?.length) return [];
    return z.array(CompanySchema).parse(pages.flat());
  }, [data?.pages]);

  return { companies, isLoading, fetchNextPage, hasNextPage };
};
