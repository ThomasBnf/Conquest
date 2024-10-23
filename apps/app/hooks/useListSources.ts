import { listSources } from "@/actions/activities/listSources";
import { useQuery } from "@tanstack/react-query";

export const useListSources = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: () => listSources(),
  });

  return { sources: data?.data, isLoading };
};
