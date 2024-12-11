import { client } from "@/lib/rpc";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { useQuery } from "@tanstack/react-query";

export const useListTags = () => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await client.api.tags.$get();
      return TagSchema.array().parse(await response.json());
    },
  });
};
