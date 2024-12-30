import { prisma } from "@/lib/prisma";
import { MemberWithCompanySchema } from "@conquest/zod/schemas/member.schema";

type Props = (
  | { id: string }
  | { discourse_id: string }
  | { linkedin_id: string }
  | { livestorm_id: string }
  | { slack_id: string }
  | { email: string }
  | { username: string }
) & {
  workspace_id: string;
};

export const getMember = async (props: Props) => {
  const { workspace_id } = props;

  const id = "id" in props ? props.id : undefined;
  const discourse_id = "discourse_id" in props ? props.discourse_id : undefined;
  const linkedin_id = "linkedin_id" in props ? props.linkedin_id : undefined;
  const livestorm_id = "livestorm_id" in props ? props.livestorm_id : undefined;
  const slack_id = "slack_id" in props ? props.slack_id : undefined;
  const email = "email" in props ? props.email : undefined;
  const username = "username" in props ? props.username : undefined;

  const whereClause = () => {
    if (email) {
      return {
        primary_email_workspace_id: {
          primary_email: email,
          workspace_id,
        },
      };
    }

    if (discourse_id) {
      return {
        discourse_id_workspace_id: {
          discourse_id,
          workspace_id,
        },
      };
    }

    if (linkedin_id) {
      return {
        linkedin_id_workspace_id: {
          linkedin_id,
          workspace_id,
        },
      };
    }

    if (livestorm_id) {
      return {
        livestorm_id_workspace_id: {
          livestorm_id,
          workspace_id,
        },
      };
    }

    if (slack_id) {
      return {
        slack_id_workspace_id: {
          slack_id,
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
