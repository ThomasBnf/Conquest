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
        const { id, deleted: isDeleted, is_bot: isBot, profile } = member;

        if (!id) {
          console.log("No id", member);
          continue;
        }

        if (profile && !isDeleted && !isBot) {
          const {
            first_name,
            last_name,
            real_name,
            email,
            phone,
            image_1024,
            title,
          } = profile;

          if (first_name === "slackbot") continue;

          const rMember = await upsertMember({
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

          if (rMember?.serverError) {
            console.log("createMember", rMember.serverError);
          }
        }
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);
  });
