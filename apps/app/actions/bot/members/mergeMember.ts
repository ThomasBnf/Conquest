import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { MemberSchema } from "@conquest/zod/member.schema";
import type { WebClient } from "@slack/web-api";
import { z } from "zod";

export const mergeMember = safeAction
  .metadata({ name: "mergeMember" })
  .schema(
    z.object({
      web: z.custom<WebClient>(),
      user: z.string(),
      workspace_id: z.string(),
    }),
  )
  .action(async ({ parsedInput: { web, user, workspace_id } }) => {
    const { profile } = await web.users.profile.get({ user });

    if (!profile) return;

    const {
      first_name,
      last_name,
      real_name,
      email,
      phone,
      image_1024,
      title,
    } = profile;

    const existingMember = await prisma.member.findUnique({
      where: {
        slack_id: user,
        workspace_id,
      },
    });

    if (existingMember) {
      const updatedEmails = new Set(existingMember.emails);
      if (email) updatedEmails.add(email);

      const updatedMember = await prisma.member.update({
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

      return MemberSchema.parse(updatedMember);
    }

    const newMember = await prisma.member.create({
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

    return MemberSchema.parse(newMember);
  });
