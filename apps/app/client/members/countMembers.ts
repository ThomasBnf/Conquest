import { client } from "@/lib/rpc";
import { tableParsers } from "@/lib/searchParamsTable";
import type { Filter } from "@conquest/zod/schemas/filters.schema";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";

type Props = {
  filters: Filter[];
};

export const countMembers = ({ filters }: Props) => {
  const [{ search }] = useQueryStates(tableParsers);

  const query = useQuery({
    queryKey: ["count-members", search, filters],
    queryFn: async () => {
      const response = await client.api.members.count.$get({
        query: {
          search,
          filters: JSON.stringify(filters),
        },
      });
      return await response.json();
    },
  });

  return {
    ...query,
    count: query.data ?? 0,
  };
};
