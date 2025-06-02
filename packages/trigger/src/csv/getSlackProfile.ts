import { updateProfile } from "@conquest/clickhouse/profile/updateProfile";
import { Profile } from "@conquest/zod/schemas/profile.schema";
import type { WebClient } from "@slack/web-api";

type Props = {
  web: WebClient;
  profile: Profile;
};

export const getSlackProfile = async ({ web, profile }: Props) => {
  const { externalId } = profile;

  const slackProfile = await web.users.info({ user: externalId });

  const { user } = slackProfile;
  const { real_name } = user ?? {};

  return await updateProfile({
    ...profile,
    attributes: {
      source: "Slack",
      realName: real_name,
    },
  });
};
