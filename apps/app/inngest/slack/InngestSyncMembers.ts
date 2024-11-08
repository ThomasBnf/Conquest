import { upsertMember } from "@/features/members/functions/upsertMember";
import { WebClient } from "@slack/web-api";
import { inngest } from "../client";

export const InngestStartMembersSync = inngest.createFunction(
  { id: "start-members-sync" },
  { event: "slack/start-members-sync" },
  async ({ event, step }) => {
    const { workspace_id, token } = event.data;
    const web = new WebClient(token);

    let cursor: string | undefined = undefined;
    let hasMore = true;
    const batchSize = 20; // Process members in smaller batches
    let processedMembers = 0;

    while (hasMore) {
      const batchResult = await step.run(
        `fetch-members-batch-${processedMembers}`,
        async () => {
          const { members, response_metadata } = await web.users.list({
            limit: 100,
            cursor,
          });

          // Send batch of members for processing
          const memberBatches = chunk(members ?? [], batchSize);
          for (const [index, batch] of memberBatches.entries()) {
            await inngest.send({
              name: "slack/process-members-batch",
              data: {
                workspace_id,
                members: batch,
                batchNumber: processedMembers + index,
              },
            });
          }

          processedMembers += (members ?? []).length;
          return {
            nextCursor: response_metadata?.next_cursor,
            count: members?.length ?? 0,
          };
        },
      );

      cursor = batchResult.nextCursor;
      hasMore = !!cursor && batchResult.count > 0;

      // Add a small delay between batches to prevent rate limiting
      if (hasMore) {
        await step.sleep("batch-delay", "5s");
      }
    }

    return { success: true, totalProcessed: processedMembers };
  },
);

export const InngestProcessMembersBatch = inngest.createFunction(
  { id: "process-members-batch" },
  { event: "slack/process-members-batch" },
  async ({ event, step }) => {
    const { workspace_id, members } = event.data;

    for (const member of members) {
      await step.run(`process-member-${member.id}`, async () => {
        const { id, deleted: isDeleted, is_bot: isBot, profile } = member;

        if (
          !id ||
          !profile ||
          isDeleted ||
          isBot ||
          profile.first_name === "Slackbot"
        ) {
          return;
        }

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
      });
    }

    return { success: true, processedCount: members.length };
  },
);

// Utility function to chunk array into smaller arrays
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
