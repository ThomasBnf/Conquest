import { prisma } from "@/lib/prisma";

type Props = {
  first_name: string | undefined;
  last_name: string | undefined;
  full_name: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  avatar_url: string | undefined;
  job_title: string | undefined;
  slack_id: string;
  workspace_id: string;
};

export const mergeContact = async ({
  first_name,
  last_name,
  full_name,
  email,
  phone,
  avatar_url,
  job_title,
  slack_id,
  workspace_id,
}: Props) => {
  const existingContact = await prisma.contact.findFirst({
    where: {
      emails: { has: email },
      workspace_id,
    },
  });

  if (existingContact) {
    const updatedEmails = new Set(existingContact.emails);
    if (email) updatedEmails.add(email);

    const contact = await prisma.contact.update({
      where: {
        id: existingContact.id,
        workspace_id,
      },
      data: {
        first_name: existingContact.first_name ?? first_name,
        last_name: existingContact.last_name ?? last_name,
        full_name: existingContact.full_name ?? full_name,
        emails: Array.from(updatedEmails).filter(Boolean),
        phone: existingContact.phone ?? phone,
        avatar_url: existingContact.avatar_url ?? avatar_url,
        job_title: existingContact.job_title ?? job_title,
        search:
          `${full_name ?? existingContact.full_name} ${Array.from(updatedEmails).join(" ")} ${existingContact.phone ?? phone}`
            .trim()
            .toLowerCase(),
        slack_id: existingContact.slack_id,
      },
    });

    return contact;
  }

  const contact = await prisma.contact.create({
    data: {
      first_name: first_name ?? null,
      last_name: last_name ?? null,
      full_name: full_name ?? null,
      emails: email ? [email] : [],
      phone: phone ?? null,
      avatar_url: avatar_url ?? null,
      job_title: job_title ?? null,
      source: "SLACK",
      search: `${full_name} ${email ?? ""} ${phone ?? ""}`.trim().toLowerCase(),
      slack_id: slack_id ?? null,
      workspace_id,
    },
  });

  return contact;
};
