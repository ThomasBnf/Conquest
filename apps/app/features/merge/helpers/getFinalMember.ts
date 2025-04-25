import { getOldestMember } from "@conquest/clickhouse/helpers/getOldestMember";
import { Member } from "@conquest/zod/schemas/member.schema";

type Props = {
  members: Member[];
};

export const getFinalMember = ({ members }: Props) => {
  if (!members.length) return null;

  const oldestMember = getOldestMember({ members });
  if (!oldestMember) return null;

  const allEmails = members.flatMap((member) => member.emails || []);
  const allPhones = members.flatMap((member) => member.phones || []);
  const allTags = members.flatMap((member) => member.tags || []);

  const avatarUrl =
    oldestMember.avatarUrl ||
    members.find((member) => member.avatarUrl)?.avatarUrl ||
    "";

  const companyId =
    oldestMember.companyId ||
    members.find((member) => member.companyId)?.companyId ||
    null;

  const linkedinUrl =
    oldestMember.linkedinUrl ||
    members.find((member) => member.linkedinUrl)?.linkedinUrl ||
    "";

  const jobTitle =
    oldestMember.jobTitle ||
    members.find((member) => member.jobTitle)?.jobTitle ||
    "";

  const country =
    oldestMember.country ||
    members.find((member) => member.country)?.country ||
    "";

  const language =
    oldestMember.language ||
    members.find((member) => member.language)?.language ||
    "";

  const finalMember: Member = {
    ...oldestMember,
    avatarUrl,
    emails: [...new Set(allEmails)],
    phones: [...new Set(allPhones)],
    tags: [...new Set(allTags)],
    jobTitle,
    linkedinUrl,
    country,
    language,
    companyId,
  };

  return finalMember;
};
