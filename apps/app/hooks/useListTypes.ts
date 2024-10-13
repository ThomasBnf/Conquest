import { useQuery } from "@tanstack/react-query";
import { listActivityType } from "queries/activities/listActivityType";

export const useListTypes = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["types"],
    queryFn: () => listActivityType(),
  });

  return { types: data?.data, isLoading };
};
