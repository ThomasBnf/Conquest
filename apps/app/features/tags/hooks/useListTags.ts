import { useQuery } from "@tanstack/react-query";
import { listTags } from "../actions/listTags";

export const useListTags = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => listTags(),
  });
  return { tags: data?.data, isLoading };
};
