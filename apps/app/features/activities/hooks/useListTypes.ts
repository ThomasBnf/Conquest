import { useQuery } from "@tanstack/react-query";
import { _listKeys } from "../actions/_listKeys";

export const useListKeys = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["keys"],
    queryFn: () => _listKeys(),
  });

  return { keys: data?.data, isLoading };
};
