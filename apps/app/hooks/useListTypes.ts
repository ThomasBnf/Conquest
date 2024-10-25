import { listTypesAction } from "@/features/activities/actions/listTypesAction";
import { useQuery } from "@tanstack/react-query";

export const useListTypes = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["types"],
    queryFn: () => listTypesAction(),
  });

  return { types: data?.data, isLoading };
};
