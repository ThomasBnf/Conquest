import type { Company } from "@conquest/zod/schemas/company.schema";
import { client } from "../client";

type Props = Company;

export const updateCompany = async (props: Props) => {
  await client.insert({
    table: "company",
    values: [
      {
        ...props,
        updatedAt: new Date(),
      },
    ],
    format: "JSON",
  });
};
