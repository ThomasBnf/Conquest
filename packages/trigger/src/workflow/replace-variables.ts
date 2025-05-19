import { MemberWithLevel } from "@conquest/zod/schemas/member.schema";

type Props = {
  message: string | undefined;
  member: MemberWithLevel;
};

export const replaceVariables = ({ message, member }: Props) => {
  if (!message) return "";

  if (message.includes("{{createdMember}}")) {
    return message.replaceAll(
      "{{createdMember}}",
      JSON.stringify(member, null, 2),
    );
  }

  const variables = {
    "{{firstName}}": member.firstName,
    "{{lastName}}": member.lastName,
    "{{primaryEmail}}": member.primaryEmail,
    "{{country}}": member.country,
    "{{language}}": member.language,
    "{{jobTitle}}": member.jobTitle,
    "{{linkedinUrl}}": member.linkedinUrl,
    "{{emails}}": member.emails.join(", "),
    "{{phones}}": member.phones.join(", "),
  };

  return Object.entries(variables).reduce(
    (acc, [key, value]) => acc.replaceAll(key, value),
    message,
  );
};
