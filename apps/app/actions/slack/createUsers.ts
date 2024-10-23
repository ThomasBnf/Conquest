"use server";

import { WebClient } from "@slack/web-api";
import { authAction } from "@/lib/authAction";
import { z } from "zod";
import { mergeMember } from "./mergeMember";

export const createUsers = authAction
  .metadata({
    name: "createUsers",
  })
  .schema(
    z.object({
      web: z.instanceof(WebClient),
    }),
  )
  .action(async ({ parsedInput: { web } }) => {
    let cursor: string | undefined;

    do {
      const { members, response_metadata } = await web.users.list({
        limit: 100,
        cursor,
      });

      for (const member of members ?? []) {
        const { id, is_email_confirmed, deleted, profile } = member;
        const isMember = is_email_confirmed;
        const isDeleted = deleted;

        if (profile && isMember && !isDeleted) {
          const {
            first_name,
            last_name,
            real_name,
            email,
            phone,
            image_1024,
            title,
          } = profile;

          await mergeMember({
            first_name,
            last_name,
            full_name: real_name,
            email,
            phone,
            avatar_url: image_1024,
            job_title: title,
            slack_id: id,
          });
        }
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);
  });
