import { useQuery } from "@tanstack/react-query";
import { listTags } from "actions/tags/listTags";

export const useListTags = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: () => listTags(),
  });

  return { tags: data?.data, isLoading };
};
