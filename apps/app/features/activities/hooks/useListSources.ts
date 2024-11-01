import { _listSources } from "@/features/activities/actions/_listSources";
import { useQuery } from "@tanstack/react-query";

export const useListSources = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: () => _listSources(),
  });

  return { sources: data?.data, isLoading };
};
