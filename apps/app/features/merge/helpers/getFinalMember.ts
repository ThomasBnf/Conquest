import { Member } from "@conquest/zod/schemas/member.schema";
import { getOldestMember } from "./getOldestMember";

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

  const avatar_url =
    oldestMember.avatar_url ||
    members.find((member) => member.avatar_url)?.avatar_url ||
    "";

  const company_id =
    oldestMember.company_id ||
    members.find((member) => member.company_id)?.company_id ||
    null;

  const linkedin_url =
    oldestMember.linkedin_url ||
    members.find((member) => member.linkedin_url)?.linkedin_url ||
    "";

  const job_title =
    oldestMember.job_title ||
    members.find((member) => member.job_title)?.job_title ||
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
    avatar_url,
    emails: [...new Set(allEmails)],
    phones: [...new Set(allPhones)],
    tags: [...new Set(allTags)],
    job_title,
    linkedin_url,
    country,
    language,
    company_id,
  };

  return finalMember;
};
