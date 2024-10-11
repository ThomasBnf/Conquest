import { listActivityType } from "@/queries/activities/listActivityType";
import { useQuery } from "@tanstack/react-query";

export const useListTypes = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["types"],
    queryFn: () => listActivityType(),
  });

  return { types: data?.data, isLoading };
};
