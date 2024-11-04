import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { MemberSchema } from "@conquest/zod/member.schema";
import { WebClient } from "@slack/web-api";
import { z } from "zod";

export const mergeSlackMember = safeAction
  .metadata({
    name: "mergeSlackMember",
  })
  .schema(
    z.object({
      user: z.string(),
      workspace_id: z.string(),
      token: z.string(),
      deleted: z.boolean().optional(),
    }),
  )
  .action(async ({ parsedInput: { user, workspace_id, token, deleted } }) => {
    const web = new WebClient(token);

    const { profile } = await web.users.profile.get({ user });

    if (!profile) return;

    const {
      first_name,
      last_name,
      real_name: full_name,
      email,
      phone,
      image_1024: avatar_url,
      title: job_title,
    } = profile;

    const formattedEmail = email?.toLowerCase().trim();
    const formattedPhone = phone?.toLowerCase().trim();

    const member = await prisma.member.upsert({
      where: {
        slack_id: user,
      },
      update: {
        first_name: first_name ?? null,
        last_name: last_name ?? null,
        full_name: full_name ?? null,
        emails: formattedEmail ? [formattedEmail] : undefined,
        phones: formattedPhone ? [formattedPhone] : undefined,
        avatar_url: avatar_url ?? null,
        job_title: job_title ?? null,
        search: search(
          { full_name },
          formattedEmail ? [formattedEmail] : undefined,
          formattedPhone ? [formattedPhone] : undefined,
        ),
        deleted_at: deleted ? new Date() : null,
      },
      create: {
        slack_id: user ?? null,
        first_name: first_name ?? null,
        last_name: last_name ?? null,
        full_name: full_name ?? null,
        emails: formattedEmail ? [formattedEmail] : undefined,
        phones: formattedPhone ? [formattedPhone] : undefined,
        avatar_url: avatar_url ?? null,
        job_title: job_title ?? null,
        source: "SLACK",
        search: search(
          { full_name },
          formattedEmail ? [formattedEmail] : undefined,
          formattedPhone ? [formattedPhone] : undefined,
        ),
        workspace_id,
      },
    });

    return MemberSchema.parse(member);
  });

const search = (
  { full_name }: { full_name: string | null | undefined },
  emails: string[] = [],
  phones: string[] = [],
) => {
  const searchTerms = [full_name, ...emails, ...phones].filter(Boolean);

  return searchTerms.join(" ").trim().toLowerCase();
};
