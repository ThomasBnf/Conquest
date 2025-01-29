import { CompanyWithMembersSchema } from "@conquest/zod/schemas/member.schema";
import { prisma } from "../../prisma";

type Props = {
  company_id: string;
  workspace_id: string;
};

export const getCompanyWithMembers = async ({
  company_id,
  workspace_id,
}: Props) => {
  const company = await prisma.companies.findUnique({
    where: {
      id: company_id,
      workspace_id,
    },
    include: {
      members: true,
    },
  });

  return CompanyWithMembersSchema.parse(company);
};
