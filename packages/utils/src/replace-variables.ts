import { listChannels } from "@conquest/clickhouse/channel/listChannels";
import { getProfileBySource } from "@conquest/clickhouse/profile/getProfileBySource";
import { Member, MemberWithLevel } from "@conquest/zod/schemas/member.schema";

type Props = {
  message: string | undefined;
  member: Member | MemberWithLevel;
  source?: "Slack" | "Discord";
};

export const replaceVariables = async ({ message, member, source }: Props) => {
  if (!message) return "";

  const { workspaceId } = member;
  let processedMessage = message;

  if (processedMessage.includes("{#")) {
    const channels = await listChannels({ source, workspaceId });
    const channelRegex = /\{#([a-zA-Z0-9_-]+)\}/g;
    const channelMatches = [...processedMessage.matchAll(channelRegex)];

    for (const match of channelMatches) {
      const channelName = match[1];
      const channel = channels.find((c) => c.name === channelName);

      if (channel?.externalId) {
        processedMessage = processedMessage.replace(
          `{#${channelName}}`,
          `<#${channel.externalId}>`,
        );
      }
    }
  }

  if (source && processedMessage.includes("{@mention}")) {
    const profile = await getProfileBySource({
      source,
      memberId: member.id,
    });

    if (profile?.externalId) {
      const profileRegex = /\{@([a-zA-Z0-9_-]+)\}/g;
      processedMessage = processedMessage.replace(
        profileRegex,
        `<@${profile.externalId}>`,
      );
    }
  }

  if (processedMessage.includes("{createdMember}")) {
    processedMessage = processedMessage.replaceAll(
      "{createdMember}",
      JSON.stringify(member, null, 2),
    );
  }

  const variables = {
    "{firstName}": member.firstName,
    "{lastName}": member.lastName,
    "{primaryEmail}": member.primaryEmail,
    "{country}": member.country,
    "{language}": member.language,
    "{jobTitle}": member.jobTitle,
    "{linkedinUrl}": member.linkedinUrl,
    "{emails}": member.emails.join(", "),
    "{phones}": member.phones.join(", "),
  };

  return Object.entries(variables).reduce(
    (acc, [key, value]) => acc.replaceAll(key, value || ""),
    processedMessage,
  );
};
// Hello tu vas bien ? tu veux aller @#feature-requests\n\nTu peux ici @first\\_name\n<br />\n\nN'hésite pas à @@mention\n",
