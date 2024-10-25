import { listSourcesAction } from "@/features/activities/actions/listSourcesAction";
import { useQuery } from "@tanstack/react-query";

export const useListSources = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: () => listSourcesAction(),
  });

  return { sources: data?.data, isLoading };
};
