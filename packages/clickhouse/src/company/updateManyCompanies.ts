import type { Company } from "@conquest/zod/schemas/company.schema";
import { client } from "../client";

type Props = {
  companies: Company[];
};

export const updateManyCompanies = async ({ companies }: Props) => {
  await client.insert({
    table: "company",
    values: companies,
    format: "JSON",
  });

  await client.query({
    query: "OPTIMIZE TABLE company FINAL;",
  });
};
