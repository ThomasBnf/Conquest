import { prisma } from "@conquest/database";

type Props = {
  workspace_id: string;
};

export const countCompanies = async ({ workspace_id }: Props) => {
  const count = await prisma.companies.count({
    where: {
      workspace_id,
    },
  });

  return count;
};
