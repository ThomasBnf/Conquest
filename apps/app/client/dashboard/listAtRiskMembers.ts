import { client } from "@/lib/rpc";
import { tableParsers } from "@/lib/searchParamsTable";
import type { Filter } from "@conquest/zod/schemas/filters.schema";
import { MemberWithCompanySchema } from "@conquest/zod/schemas/member.schema";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";

type Props = {
  from: Date;
  to: Date;
  filters: Filter[];
};

export const listAtRiskMembers = ({ from, to, filters }: Props) => {
  const [{ search, idMember, descMember, page, pageSize }] =
    useQueryStates(tableParsers);

  const query = useQuery({
    queryKey: [
      "members",
      "at-risk-members",
      search,
      idMember,
      descMember,
      page,
      pageSize,
      filters,
      from,
      to,
    ],
    queryFn: async () => {
      const response = await client.api.dashboard["at-risk-members"].$get({
        query: {
          search,
          id: idMember,
          desc: descMember ? "true" : "false",
          page: page.toString(),
          pageSize: pageSize.toString(),
          filters: JSON.stringify(filters),
          from: from.toISOString(),
          to: to.toISOString(),
        },
      });

      const { members, count } = await response.json();

      return {
        members: MemberWithCompanySchema.array().parse(members),
        count,
      };
    },
  });

  return {
    ...query,
    members: query.data?.members,
    count: query.data?.count,
  };
};
