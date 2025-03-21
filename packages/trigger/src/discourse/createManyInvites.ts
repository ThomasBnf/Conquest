import { createActivity } from "@conquest/clickhouse/activities/createActivity";
import { getProfile } from "@conquest/clickhouse/profiles/getProfile";
import { decrypt } from "@conquest/db/utils/decrypt";
import type { DiscourseIntegration } from "@conquest/zod/schemas/integration.schema";
import type { DiscourseProfile } from "@conquest/zod/schemas/profile.schema";
import { InviteSchema } from "@conquest/zod/types/discourse";
import { startOfDay, subDays } from "date-fns";

type Props = {
  discourse: DiscourseIntegration;
  profile: DiscourseProfile;
};

export const createManyInvites = async ({ discourse, profile }: Props) => {
  const { details, workspace_id } = discourse;
  const { community_url, api_key, api_key_iv } = details;
  const { member_id, attributes } = profile;
  const { username } = attributes;

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
      `${community_url}/u/${username}/invited.json?filter=redeemed${
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

    const data = await response.json();
    const invites = InviteSchema.array().parse(data.invites);

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
        message: "invitation accepted",
        invite_to: invitee.id,
        member_id: member_id,
        created_at: new Date(redeemed_at),
        updated_at: new Date(redeemed_at),
        source: "Discourse",
        workspace_id,
      });
    }
    hasMore = invites.length === 40;
    offSet += 40;
  }
};
