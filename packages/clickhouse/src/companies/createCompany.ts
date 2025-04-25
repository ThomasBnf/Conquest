import type { Company } from "@conquest/zod/schemas/company.schema";
import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import { client } from "../client";
import { getCompany } from "./getCompany";

type Props = Partial<Company>;

export const createCompany = async (props: Props) => {
  const id = uuid();
  const { updatedAt, createdAt, ...rest } = props;

  await client.insert({
    table: "company",
    values: [
      {
        id,
        ...rest,
        updatedAt: format(updatedAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
        createdAt: format(createdAt ?? new Date(), "yyyy-MM-dd HH:mm:ss"),
      },
    ],
    format: "JSON",
  });

  return getCompany({ id });
};
