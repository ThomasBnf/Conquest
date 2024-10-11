import { listTags } from "@/actions/tags/listTags";
import { useQuery } from "@tanstack/react-query";

export const useListTags = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: () => listTags(),
  });

  return { tags: data?.data, isLoading };
};
