"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { WebClient } from "@slack/web-api";
import { z } from "zod";

export const createUsers = authAction
  .metadata({
    name: "createUsers",
  })
  .schema(
    z.object({
      web: z.instanceof(WebClient),
    }),
  )
  .action(async ({ ctx, parsedInput: { web } }) => {
    const workspace_id = ctx.user.workspace_id;

    let cursor: string | undefined;

    do {
      const { members, response_metadata } = await web.users.list({ limit: 100, cursor });

      for (const member of members ?? []) {
        const isMember = member.is_email_confirmed;
        const isDeleted = member.deleted;
        const profile = member.profile;

        if (profile && isMember && !isDeleted) {
          const { first_name, last_name, real_name, email, phone, image_1024, title } = profile;

          const existingContact = await prisma.contact.findFirst({
            where: {
              emails: { has: email },
              workspace_id,
            },
          });

          if (existingContact) {
            const updatedEmails = new Set(existingContact.emails);
            if (email) updatedEmails.add(email);

            await prisma.contact.update({
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
                slack_id: member.id,
                updated_at: new Date(),
              },
            });
          } else {
            await prisma.contact.create({
              data: {
                first_name: first_name ?? null,
                last_name: last_name ?? null,
                full_name: real_name,
                emails: email ? [email] : [],
                phone: phone ?? null,
                avatar_url: image_1024 ?? null,
                job_title: title ?? null,
                slack_id: member.id,
                search: `${real_name} ${email ?? ""} ${phone ?? ""}`.trim().toLowerCase(),
                source: "SLACK",
                joined_at: new Date(),
                workspace_id,
              },
            });
          }
        }
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);
  });
