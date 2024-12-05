import { client } from "@/lib/rpc";
import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { useQuery } from "@tanstack/react-query";

export const useListCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await client.api.companies.$get();

      return CompanySchema.array().parse(await response.json());
    },
  });
};
