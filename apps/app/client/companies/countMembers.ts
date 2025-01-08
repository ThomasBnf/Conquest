import { client } from "@/lib/rpc";
import { tableParsers } from "@/lib/searchParamsTable";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";

export const countCompanies = () => {
  const [{ search }] = useQueryStates(tableParsers);

  const query = useQuery({
    queryKey: ["count-companies", search],
    queryFn: async () => {
      const response = await client.api.companies.count.$get({
        query: {
          search,
        },
      });
      return await response.json();
    },
  });

  return {
    ...query,
    count: query.data,
  };
};
