import { CompanySchema } from "@conquest/zod/schemas/company.schema";
import { SOURCE, prisma } from "../prisma";

type Props = {
  name: string;
  domain?: string | null;
  source: SOURCE;
  workspaceId: string;
};

export const createCompany = async (props: Props) => {
  const { name, domain, source, workspaceId } = props;

  const company = await prisma.company.create({
    data: {
      name,
      domain,
      source,
      workspaceId,
    },
  });

  return CompanySchema.parse(company);
};
