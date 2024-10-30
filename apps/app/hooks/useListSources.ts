import { listSources } from "@/features/activities/actions/listSources";
import { useQuery } from "@tanstack/react-query";

export const useListSources = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: () => listSources(),
  });

  return { sources: data?.data, isLoading };
};
