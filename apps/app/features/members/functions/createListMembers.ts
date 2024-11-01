import { safeAction } from "@/lib/safeAction";
import { WebClient } from "@slack/web-api";
import { z } from "zod";
import { mergeMember } from "./mergeMember";

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

          const rMember = await mergeMember({
            slack_id: id,
            first_name,
            last_name,
            full_name: real_name,
            email,
            phone,
            avatar_url: image_1024,
            job_title: title,
            workspace_id,
          });

          if (rMember?.serverError) {
            console.error(rMember.serverError);
          }
        }
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);
  });
