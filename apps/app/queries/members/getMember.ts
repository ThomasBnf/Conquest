import { prisma } from "@/lib/prisma";
import { MemberWithCompanySchema } from "@conquest/zod/schemas/member.schema";

type Props = (
  | { id: string; source?: never }
  | { email: string; source?: never }
  | { username: string; source?: never }
  | { id: string; source: "SLACK" | "DISCOURSE" }
) & {
  workspace_id: string;
};

export const getMember = async (props: Props) => {
  const { workspace_id } = props;

  const id = "id" in props ? props.id : undefined;
  const email = "email" in props ? props.email : undefined;
  const username = "username" in props ? props.username : undefined;
  const source = "source" in props ? props.source : undefined;

  const whereClause = () => {
    if (email) {
      return {
        primary_email_workspace_id: {
          primary_email: email,
          workspace_id,
        },
      };
    }

    if (username) {
      return {
        username_workspace_id: {
          username,
          workspace_id,
        },
      };
    }

    if (id && source === "SLACK") {
      return {
        slack_id_workspace_id: {
          slack_id: id,
          workspace_id,
        },
      };
    }

    if (id && source === "DISCOURSE") {
      return {
        discourse_id_workspace_id: {
          discourse_id: id,
          workspace_id,
        },
      };
    }

    return { id };
  };

  const where = whereClause();

  const member = await prisma.members.findUnique({
    where,
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
    company_id: member.company?.id ?? null,
    company_name: member.company?.name ?? null,
  });
};
