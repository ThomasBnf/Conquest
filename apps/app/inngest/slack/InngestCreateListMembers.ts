import { upsertMember } from "@/features/members/functions/upsertMember";
import { WebClient } from "@slack/web-api";
import { inngest } from "../client";

export const InngestCreateListMembers = inngest.createFunction(
  { id: "create-list-members" },
  { event: "slack/create-list-members" },
  async ({ event, step }) => {
    const { workspace_id, token } = event.data;

    const web = new WebClient(token);

    let cursor: string | undefined;

    do {
      const { members, response_metadata } = await web.users.list({
        limit: 100,
        cursor,
      });

      for (const member of members ?? []) {
        await step.run(`upsertMember-${member.id}`, async () => {
          const { id, deleted: isDeleted, is_bot: isBot, profile } = member;

          if (!id) {
            console.log("No id", member);
            return;
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

            if (first_name === "Slackbot") return;

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
        });
      }

      cursor = response_metadata?.next_cursor;
    } while (cursor);

    return { success: true };
  },
);
