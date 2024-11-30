import { useQuery } from "@tanstack/react-query";
import { _listTags } from "../actions/listTags";

export const useListTags = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => _listTags(),
  });
  return { tags: data?.data, isLoading };
};
