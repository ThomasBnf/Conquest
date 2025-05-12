import type { Company } from "@conquest/zod/schemas/company.schema";
import { v4 as uuid } from "uuid";
import { client } from "../client";
import { getCompany } from "./getCompany";

type Props = Partial<Company>;

export const createCompany = async (props: Props) => {
  const id = uuid();

  await client.insert({
    table: "company",
    values: [
      {
        id,
        ...props,
      },
    ],
    format: "JSON",
  });

  return getCompany({ id });
};
