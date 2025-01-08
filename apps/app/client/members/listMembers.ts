import { client } from "@/lib/rpc";
import { tableParsers } from "@/lib/searchParamsTable";
import type { Filter } from "@conquest/zod/schemas/filters.schema";
import { MemberWithCompanySchema } from "@conquest/zod/schemas/member.schema";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";

type Props = {
  filters: Filter[];
};

export const listMembers = ({ filters }: Props) => {
  const [{ search, idMember, descMember, page, pageSize }] =
    useQueryStates(tableParsers);

  const query = useQuery({
    queryKey: [
      "members",
      search,
      idMember,
      descMember,
      page,
      pageSize,
      filters,
    ],
    queryFn: async () => {
      const response = await client.api.members.$get({
        query: {
          search,
          id: idMember,
          desc: descMember ? "true" : "false",
          page: page.toString(),
          pageSize: pageSize.toString(),
          filters: JSON.stringify(filters),
        },
      });

      return MemberWithCompanySchema.array().parse(await response.json());
    },
  });

  return {
    ...query,
    members: query.data,
  };
};
