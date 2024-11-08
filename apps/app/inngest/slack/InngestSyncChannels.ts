import { createChannel } from "@/features/channels/functions/createChannel";
import { listMessages } from "@/features/slack/functions/listMessages";
import { WebClient } from "@slack/web-api";
import { inngest } from "../client";

export const InngestStartChannelsSync = inngest.createFunction(
  { id: "start-channels-sync" },
  { event: "slack/start-channels-sync" },
  async ({ event, step }) => {
    const { workspace_id, token } = event.data;
    const web = new WebClient(token);
    let cursor: string | undefined = undefined;
    let hasMore = true;
    const batchSize = 10; // Process channels in smaller batches
    let processedChannels = 0;

    while (hasMore) {
      const batchResult = await step.run(
        `fetch-channels-batch-${processedChannels}`,
        async () => {
          const { channels, response_metadata } = await web.conversations.list({
            limit: 100,
            cursor,
            types: "public_channel,private_channel",
            exclude_archived: true,
          });

          // Send batch of channels for processing
          const channelBatches = chunk(channels ?? [], batchSize);
          for (const [index, batch] of channelBatches.entries()) {
            await inngest.send({
              name: "slack/process-channels-batch",
              data: {
                workspace_id,
                token,
                channels: batch,
                batchNumber: processedChannels + index,
              },
            });
          }

          processedChannels += (channels ?? []).length;
          return {
            nextCursor: response_metadata?.next_cursor,
            count: channels?.length ?? 0,
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

    return { success: true, totalProcessed: processedChannels };
  },
);

export const InngestProcessChannelsBatch = inngest.createFunction(
  { id: "process-channels-batch" },
  { event: "slack/process-channels-batch" },
  async ({ event, step }) => {
    const { workspace_id, token, channels } = event.data;
    const web = new WebClient(token);

    for (const channel of channels) {
      const { name, id } = channel;
      if (!name || !id) continue;

      await step.run(`process-channel-${id}`, async () => {
        const rChannel = await createChannel({
          name: name,
          source: "SLACK",
          external_id: id,
          workspace_id,
        });

        if (!rChannel?.data) return;

        await web.conversations.join({
          channel: rChannel.data.external_id ?? "",
          token,
        });

        // Send message sync event for this channel
        await inngest.send({
          name: "slack/sync-channel-messages",
          data: {
            workspace_id,
            token,
            channel: rChannel.data,
          },
        });
      });
    }

    return { success: true, processedCount: channels.length };
  },
);

export const InngestSyncChannelMessages = inngest.createFunction(
  { id: "sync-channel-messages" },
  { event: "slack/sync-channel-messages" },
  async ({ event, step }) => {
    const { workspace_id, token, channel } = event.data;
    const web = new WebClient(token);

    return await step.run("sync-messages", async () => {
      await listMessages({ web, channel, workspace_id });
      return { success: true };
    });
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
