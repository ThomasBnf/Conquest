import { client } from "@/lib/rpc";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { useQuery } from "@tanstack/react-query";

type Props = {
  workspace_id: string;
};

export const useListTags = ({ workspace_id }: Props) => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await client.api.tags.$get({
        query: { workspace_id },
      });
      return TagSchema.array().parse(await response.json());
    },
  });
};
