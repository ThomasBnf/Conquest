import { upsertMember } from "@/features/members/functions/upsertMember";
import { safeAction } from "@/lib/safeAction";
import { WebClient } from "@slack/web-api";
import { z } from "zod";

export const createListMembers = safeAction
  .metadata({
    name: "createListMembers",
  })
  .schema(
    z.object({
      web: z.instanceof(WebClient),
      workspace_id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { web, workspace_id } }) => {
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

        if (!id) {
          console.log("No id", member);
          continue;
        }

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

          await upsertMember({
            id,
            source: "SLACK",
            first_name,
            last_name,
            full_name: real_name,
            email,
            phone,
            avatar_url: image_1024,
            job_title: title,
            workspace_id,
          });
        }
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);
  });
