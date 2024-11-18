import { useQuery } from "@tanstack/react-query";
import { _listLocale } from "../actions/_listLocale";

export const useListLocales = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["locales"],
    queryFn: () => _listLocale(),
  });

  return { locales: data?.data, isLoading };
};
