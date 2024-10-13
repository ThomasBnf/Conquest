import { useQuery } from "@tanstack/react-query";
import { listActivitySource } from "queries/activities/listActivitySource";

export const useListSources = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: () => listActivitySource(),
  });

  return { sources: data?.data, isLoading };
};
