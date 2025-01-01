import type { DiscourseIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Invite } from "@conquest/zod/schemas/types/discourse";
import { startOfDay, subDays } from "date-fns";
import { createActivity } from "../activities/createActivity";
import { getActivityType } from "../activity-type/getActivityType";
import { getMember } from "../members/getMember";

type Props = {
  discourse: DiscourseIntegration;
  member: Member;
};

export const createManyInvites = async ({ discourse, member }: Props) => {
  const { details, workspace_id } = discourse;
  const { community_url, api_key } = details;
  const { username } = member;

  const today = startOfDay(new Date());
  const last365Days = subDays(today, 365);

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

    if (!response.ok) {
      hasMore = false;
      break;
    }

    const recentInvites = invites.filter(
      (invite) => new Date(invite.redeemed_at) >= last365Days,
    );

    if (recentInvites.length === 0) {
      hasMore = false;
      break;
    }

    for (const invite of recentInvites) {
      const { redeemed_at, user } = invite;

      const inviteTo = await getMember({
        discourse_id: String(user.id),
        workspace_id,
      });

      if (!inviteTo) continue;

      await createActivity({
        external_id: null,
        activity_type_id: invite_type.id,
        message: `${inviteTo.username} accepted your invitation`,
        invite_to: inviteTo.id,
        member_id: member.id,
        channel_id: null,
        created_at: new Date(redeemed_at),
        updated_at: new Date(redeemed_at),
        workspace_id,
      });
    }

    hasMore = invites.length === 40;
    offSet += 40;
  }
};
