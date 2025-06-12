import { client } from "@conquest/clickhouse/client";
import { getCompanyByName } from "@conquest/clickhouse/company/getCompanyByName";
import { Company, CompanySchema } from "@conquest/zod/schemas/company.schema";
import { randomUUID } from "node:crypto";

type Props = {
  members: Record<string, string>[];
  workspaceId: string;
};

export const processCompanies = async ({
  members,
  workspaceId,
}: Props): Promise<Company[]> => {
  const companies = [...new Set(members.map((member) => member.company))];

  const createdCompanies: Company[] = [];

  for (const companyName of companies) {
    if (!companyName) continue;

    const company = await getCompanyByName({ name: companyName, workspaceId });

    if (company) {
      createdCompanies.push(company);
      continue;
    }

    const newCompany: Company = {
      id: randomUUID(),
      name: companyName,
      industry: "",
      address: "",
      domain: "",
      employees: null,
      foundedAt: null,
      logoUrl: "",
      tags: [],
      source: "Manual",
      customFields: {
        fields: [],
      },
      workspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await client.insert({
      table: "company",
      values: [newCompany],
      format: "JSON",
    });

    createdCompanies.push(CompanySchema.parse(newCompany));
  }

  return CompanySchema.array().parse(createdCompanies);
};
