import { prisma } from "@/lib/prisma";
import type { App, StringIndexed } from "@slack/bolt";
import { getIntegration } from "../integrations/getIntegration";
import { getMember } from "./getMember";

type Props = {
  app: App<StringIndexed>;
  team: string;
  user: string;
};

export const mergeMember = async ({ app, team, user }: Props) => {
  const integration = await getIntegration({ external_id: team });
  const workspace_id = integration?.workspace_id;

  if (!workspace_id) return;

  const { profile } = await app.client.users.profile.get({ user });

  if (!profile) return;

  const { first_name, last_name, real_name, email, phone, image_1024, title } =
    profile;

  const existingMember = await getMember({ slack_id: user });

  if (existingMember) {
    const updatedEmails = new Set(existingMember.emails);
    if (email) updatedEmails.add(email);

    return await prisma.member.update({
      where: {
        id: existingMember.id,
        workspace_id,
      },
      data: {
        first_name: existingMember.first_name ?? first_name,
        last_name: existingMember.last_name ?? last_name,
        full_name: existingMember.full_name ?? real_name,
        emails: Array.from(updatedEmails).filter(Boolean),
        phone: existingMember.phone ?? phone,
        avatar_url: existingMember.avatar_url ?? image_1024,
        job_title: existingMember.job_title ?? title,
        search:
          `${real_name ?? existingMember.full_name} ${Array.from(updatedEmails).join(" ")} ${existingMember.phone ?? phone}`
            .trim()
            .toLowerCase(),
        slack_id: existingMember.slack_id,
      },
    });
  }

  return await prisma.member.create({
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
