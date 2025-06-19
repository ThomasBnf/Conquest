import { createCompany } from "@conquest/db/company/createCompany";
import { getCompanyByName } from "@conquest/db/company/getCompanyByName";
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
      industry: null,
      address: null,
      domain: null,
      employees: null,
      foundedAt: null,
      logoUrl: null,
      tags: [],
      source: "Manual",
      customFields: [],
      workspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await createCompany({
      ...newCompany,
    });

    createdCompanies.push(CompanySchema.parse(newCompany));
  }

  return CompanySchema.array().parse(createdCompanies);
};
