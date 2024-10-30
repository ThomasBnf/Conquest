import { listTypes } from "@/features/activities/actions/listTypes";
import { useQuery } from "@tanstack/react-query";

export const useListTypes = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["types"],
    queryFn: () => listTypes(),
  });

  return { types: data?.data, isLoading };
};
