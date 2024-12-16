import { prisma } from "@/lib/prisma";
import type { SOURCE } from "@conquest/database/src";
import { MemberWithCompanySchema } from "@conquest/zod/schemas/member.schema";
import { idParser } from "../helpers/idParser";

type Props = {
  id: string;
  source?: SOURCE;
  workspace_id: string;
};

export const getMember = async ({ id, source, workspace_id }: Props) => {
  const idInput = idParser({ source, id });

  const member = await prisma.members.findUnique({
    where: {
      ...idInput,
      workspace_id,
    },
    include: {
      company: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });

  if (!member) return null;

  return MemberWithCompanySchema.parse({
    ...member,
    company_id: member?.company?.id ?? null,
    company_name: member?.company?.name ?? null,
  });
};
