import { listActivitySource } from "@/queries/activities/listActivitySource";
import { useQuery } from "@tanstack/react-query";

export const useListSources = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: () => listActivitySource(),
  });

  return { sources: data?.data, isLoading };
};
