import { prisma } from "@/lib/prisma";
import type { DiscourseIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Invite } from "@conquest/zod/schemas/types/discourse";
import { getActivityType } from "../activity-type/getActivityType";

type Props = {
  discourse: DiscourseIntegration;
  member: Member;
};

export const createManyInvites = async ({ discourse, member }: Props) => {
  const { details, workspace_id } = discourse;
  const { community_url, api_key } = details;
  const { username } = member;

  const invite_type = await getActivityType({
    workspace_id,
    key: "discourse:invite",
  });

  let offSet = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${community_url}/u/${username}/invited.json?filter=redeemed${
        offSet ? `&offset=${offSet}` : ""
      }`,
      {
        method: "GET",
        headers: {
          "Api-Key": api_key,
          "Api-Username": "system",
        },
      },
    );

    const dataInvites = await response.json();
    const invites = dataInvites.invites as Invite[];

    if (invites.length === 0) {
      hasMore = false;
      break;
    }

    for (const invite of invites) {
      const { id, redeemed_at, user } = invite;

      const invited = await prisma.members.findFirst({
        where: {
          discourse_id: String(user.id),
          workspace_id,
        },
      });

      if (!invited) continue;

      await prisma.activities.create({
        data: {
          external_id: null,
          activity_type_id: invite_type.id,
          message: `Has invited ${invited.username}`,
          member_id: invited.id,
          invite_by: member.id,
          channel_id: null,
          created_at: redeemed_at,
          workspace_id,
        },
      });
    }

    offSet += 40;
  }
};
