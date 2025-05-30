import { getMember } from "@conquest/clickhouse/member/getMember";
import { getProfile } from "@conquest/clickhouse/profile/getProfile";
import { Member } from "@conquest/zod/schemas/member.schema";
import { Profile } from "@conquest/zod/schemas/profile.schema";

type Props = {
  memberData: Record<string, string>;
  workspaceId: string;
};

export const getMemberByExternalId = async ({
  memberData,
  workspaceId,
}: Props): Promise<Member | null> => {
  const { discordId, discordUsername, githubId, livestormId, slackId } =
    memberData;

  let member: Member | null = null;
  let profile: Profile | null = null;

  if (discordId) {
    profile = await getProfile({ externalId: discordId, workspaceId });
  }

  if (discordUsername) {
    profile = await getProfile({ username: discordUsername, workspaceId });
  }

  if (githubId) {
    profile = await getProfile({ externalId: githubId, workspaceId });
  }

  if (livestormId) {
    profile = await getProfile({ externalId: livestormId, workspaceId });
  }

  if (slackId) {
    profile = await getProfile({ externalId: slackId, workspaceId });
  }

  if (profile) {
    member = await getMember({ id: profile.memberId, workspaceId });
  }

  return member;
};
