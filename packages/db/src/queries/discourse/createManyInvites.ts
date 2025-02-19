import type { DiscourseIntegration } from "@conquest/zod/schemas/integration.schema";
import type { DiscourseProfile } from "@conquest/zod/schemas/profile.schema";
import type { Invite } from "@conquest/zod/types/discourse";
import { startOfDay, subDays } from "date-fns";
import { decrypt } from "../../lib/decrypt";
import { createActivity } from "../activity/createActivity";
import { getProfile } from "../profile/getProfile";

type Props = {
  discourse: DiscourseIntegration;
  profile: DiscourseProfile;
};

export const createManyInvites = async ({ discourse, profile }: Props) => {
  const { details, workspace_id } = discourse;
  const { community_url, community_url_iv, api_key, api_key_iv } = details;
  const { member_id, attributes } = profile;
  const { username } = attributes;

  const decryptedCommunityUrl = await decrypt({
    access_token: community_url,
    iv: community_url_iv,
  });

  const decryptedApiKey = await decrypt({
    access_token: api_key,
    iv: api_key_iv,
  });

  const today = startOfDay(new Date());
  const last365Days = subDays(today, 365);

  let offSet = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${decryptedCommunityUrl}/u/${username}/invited.json?filter=redeemed${
        offSet ? `&offset=${offSet}` : ""
      }`,
      {
        method: "GET",
        headers: {
          "Api-Key": decryptedApiKey,
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

      const invitee = await getProfile({
        external_id: String(user.id),
        workspace_id,
      });

      if (!invitee) continue;

      await createActivity({
        activity_type_key: "discourse:invite",
        message: "",
        invite_to: invitee.id,
        member_id: member_id,
        created_at: new Date(redeemed_at),
        updated_at: new Date(redeemed_at),
        source: "DISCOURSE",
        workspace_id,
      });
    }
    hasMore = invites.length === 40;
    offSet += 40;
  }
};
