import { useQuery } from "@tanstack/react-query";
import { listTagsAction } from "../actions/listTagsAction";

export const useListTags = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => listTagsAction(),
  });
  return { tags: data?.data, isLoading };
};
