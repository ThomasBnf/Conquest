import type { Tag } from "@conquest/zod/tag.schema";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";

export const useListTags = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => await ky.get("/api/tags").json<Tag[]>(),
  });
  return { tags: data, isLoading };
};
