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
  const { details, workspaceId } = discourse;
  const { communityUrl, apiKey, apiKeyIv } = details;
  const { memberId, attributes } = profile;
  const { username } = attributes;

  const decryptedApiKey = await decrypt({
    accessToken: apiKey,
    iv: apiKeyIv,
  });

  const today = startOfDay(new Date());
  const last365Days = subDays(today, 365);

  let offSet = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${communityUrl}/u/${username}/invited.json?filter=redeemed${
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
        externalId: String(user.id),
        workspaceId,
      });

      if (!invitee) continue;

      await createActivity({
        activityTypeKey: "discourse:invite",
        message: "invitation accepted",
        inviteTo: invitee.id,
        memberId,
        createdAt: new Date(redeemed_at),
        updatedAt: new Date(redeemed_at),
        source: "Discourse",
        workspaceId,
      });
    }
    hasMore = invites.length === 40;
    offSet += 40;
  }
};
