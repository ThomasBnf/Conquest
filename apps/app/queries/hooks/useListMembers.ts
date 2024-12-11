import { client } from "@/lib/rpc";
import { tableParsers } from "@/lib/searchParamsTable";
import type { Filter } from "@conquest/zod/schemas/filters.schema";
import { MemberWithCompanySchema } from "@conquest/zod/schemas/member.schema";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";

type Props = {
  filters: Filter[];
};

export const useListMembers = ({ filters }: Props) => {
  const [{ search, id, desc, page, pageSize }] = useQueryStates(tableParsers);

  return useQuery({
    queryKey: ["members", search, id, desc, page, pageSize, filters],
    queryFn: async () => {
      const response = await client.api.members.$get({
        query: {
          search,
          id,
          desc: desc ? "true" : "false",
          page: page.toString(),
          pageSize: pageSize.toString(),
          filters: JSON.stringify(filters),
        },
      });

      return MemberWithCompanySchema.array().parse(await response.json());
    },
  });
};
