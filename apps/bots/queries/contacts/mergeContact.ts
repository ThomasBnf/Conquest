import { prisma } from "@/lib/prisma";
import type { App, StringIndexed } from "@slack/bolt";
import { getIntegration } from "../integrations/getIntegration";
import { getContact } from "./getContact";

type Props = {
  app: App<StringIndexed>;
  team: string;
  user: string;
};

export const mergeContact = async ({ app, team, user }: Props) => {
  const integration = await getIntegration({ external_id: team });
  const workspace_id = integration?.workspace_id;

  if (!workspace_id) return;

  const { profile } = await app.client.users.profile.get({ user });

  if (!profile) return;

  const { first_name, last_name, real_name, email, phone, image_1024, title } =
    profile;

  const existingContact = await getContact({ slack_id: user });

  if (existingContact) {
    const updatedEmails = new Set(existingContact.emails);
    if (email) updatedEmails.add(email);

    return await prisma.contact.update({
      where: {
        id: existingContact.id,
        workspace_id,
      },
      data: {
        first_name: existingContact.first_name ?? first_name,
        last_name: existingContact.last_name ?? last_name,
        full_name: existingContact.full_name ?? real_name,
        emails: Array.from(updatedEmails).filter(Boolean),
        phone: existingContact.phone ?? phone,
        avatar_url: existingContact.avatar_url ?? image_1024,
        job_title: existingContact.job_title ?? title,
        search:
          `${real_name ?? existingContact.full_name} ${Array.from(updatedEmails).join(" ")} ${existingContact.phone ?? phone}`
            .trim()
            .toLowerCase(),
        slack_id: existingContact.slack_id,
      },
    });
  }

  return await prisma.contact.create({
    data: {
      first_name: first_name ?? null,
      last_name: last_name ?? null,
      full_name: real_name ?? null,
      emails: email ? [email] : [],
      phone: phone ?? null,
      avatar_url: image_1024 ?? null,
      job_title: title ?? null,
      source: "SLACK",
      search: `${real_name ?? ""} ${email ?? ""} ${phone ?? ""}`
        .trim()
        .toLowerCase(),
      slack_id: user,
      workspace_id,
    },
  });
};
