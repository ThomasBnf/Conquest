import { prisma } from "@/lib/prisma";
import { MemberWithCompanySchema } from "@conquest/zod/schemas/member.schema";

type Props = (
  | { id: string }
  | { discord_id: string }
  | { discourse_id: string }
  | { linkedin_id: string }
  | { livestorm_id: string }
  | { slack_id: string }
  | { discord_username: string }
  | { discourse_username: string }
) & {
  workspace_id: string;
};

export const getMember = async (props: Props) => {
  const { workspace_id } = props;

  const id = "id" in props ? props.id : undefined;
  const discord_id = "discord_id" in props ? props.discord_id : undefined;
  const discourse_id = "discourse_id" in props ? props.discourse_id : undefined;
  const linkedin_id = "linkedin_id" in props ? props.linkedin_id : undefined;
  const livestorm_id = "livestorm_id" in props ? props.livestorm_id : undefined;
  const slack_id = "slack_id" in props ? props.slack_id : undefined;
  const discord_username =
    "discord_username" in props ? props.discord_username : undefined;
  const discourse_username =
    "discourse_username" in props ? props.discourse_username : undefined;

  const whereClause = () => {
    if (discord_id) {
      return {
        discord_id_workspace_id: {
          discord_id,
          workspace_id,
        },
      };
    }

    if (discord_username) {
      return {
        discord_username_workspace_id: {
          discord_username,
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

    if (discourse_username) {
      return {
        discourse_username_workspace_id: {
          discourse_username,
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

    return { id };
  };

  const where = whereClause();

  const member = await prisma.members.findUnique({
    where,
    include: {
      company: true,
    },
  });

  if (!member) return null;

  return MemberWithCompanySchema.parse(member);
};
