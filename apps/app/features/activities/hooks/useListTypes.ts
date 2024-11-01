import { _listTypes } from "@/features/activities/actions/_listTypes";
import { useQuery } from "@tanstack/react-query";

export const useListTypes = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["types"],
    queryFn: () => _listTypes(),
  });

  return { types: data?.data, isLoading };
};
