import { client } from "@/lib/rpc";
import { tableParsers } from "@/lib/searchParamsTable";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";

export const listCompanies = () => {
  const [{ search, idCompany, descCompany, page, pageSize }] =
    useQueryStates(tableParsers);

  const query = useQuery({
    queryKey: ["companies", search, idCompany, descCompany, page, pageSize],
    queryFn: async () => {
      const response = await client.api.companies.$get({
        query: {
          search,
          id: idCompany,
          desc: descCompany ? "true" : "false",
          page: page.toString(),
          pageSize: pageSize.toString(),
        },
      });

      return CompanySchema.array().parse(await response.json());
    },
  });

  return {
    ...query,
    companies: query.data,
  };
};
