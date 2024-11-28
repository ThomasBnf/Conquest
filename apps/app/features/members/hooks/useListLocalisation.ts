import { useQuery } from "@tanstack/react-query";
import { _listLocalisation } from "../actions/_listLocalisation";

export const useListLocalisation = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["localisations"],
    queryFn: () => _listLocalisation(),
  });

  return { localisations: data?.data, isLoading };
};
