import { App, type KnownEventFromType } from "@slack/bolt";
import type { GenericMessageEvent } from "@slack/types";
import dotenv from "dotenv";
import express from "express";
import { getAttachements } from "./helpers/getAttachements";
import { createActivity } from "./queries/activities/createActivity";
import { deleteActivity } from "./queries/activities/deleteActivity";
import { listActivities } from "./queries/activities/listActivities";
import { updateActivity } from "./queries/activities/updateActivity";
import { createChannel } from "./queries/channels/createChannel";
import { deleteChannel } from "./queries/channels/deleteChannel";
import { updateChannel } from "./queries/channels/updateChannel";
import { mergeContact } from "./queries/contacts/mergeContact";
import { updateContact } from "./queries/contacts/updateContact";
import { getIntegration } from "./queries/integrations/getIntegration";
import { updateIntegration } from "./queries/integrations/updateIntegration";
import { deleteReactions } from "./queries/reactions/deleteReactions";

dotenv.config();

const appExpress = express();
const port = process.env.PORT || 4000;

const token = process.env.SLACK_BOT_TOKEN;
const signingSecret = process.env.SLACK_SIGNING_SECRET;
const appToken = process.env.SLACK_APP_TOKEN;

const app = new App({
  token,
  signingSecret,
  socketMode: true,
  appToken,
});

app.event("channel_created", async ({ event }) => {
  const { name, id, context_team_id } = event.channel;

  const integration = await getIntegration({ external_id: context_team_id });
  const workspace_id = integration?.workspace_id;

  if (!workspace_id) return;

  await createChannel({
    name,
    external_id: id,
    source: "SLACK",
    workspace_id,
  });
});

app.event("channel_rename", async ({ event }) => {
  const { id, name } = event.channel;
  await updateChannel({ external_id: id, name });
});

app.event("channel_deleted", async ({ event }) => {
  const { channel } = event;
  const activities = await listActivities({ channel_id: channel });

  for (const activity of activities ?? []) {
    const { ts } = activity.details as { ts: string };
    if (!ts) continue;

    await deleteActivity({ channel_id: channel, ts });
    await deleteReactions({ channel_id: channel, ts });
  }

  await deleteChannel({ external_id: channel });
});

app.event("message", async ({ event, message }) => {
  console.log("SLACK MESSAGE", message);

  const { team, user } = event as KnownEventFromType<"event">;
  const { channel, type, ts, subtype } = message;

  const contact = await mergeContact({ app, team, user });
  const workspace_id = contact?.workspace_id;

  if (!contact || !workspace_id) return;

  if (type === "message") {
    if (subtype === undefined) {
      const { text, thread_ts } = message;

      await createActivity({
        contact_id: contact.id,
        channel_id: channel,
        details: {
          message: text ?? "",
          source: "SLACK",
          type: thread_ts ? "REPLY" : "MESSAGE",
          attachments: [],
          files: [],
          ts,
        },
        workspace_id,
      });
    }
    if (subtype === "message_changed") {
      const { text, ts, thread_ts } = message.message as GenericMessageEvent;
      const attachments = getAttachements(text);
      await updateActivity({
        ts,
        details: {
          message: text ?? "",
          source: "SLACK",
          type: thread_ts ? "REPLY" : "MESSAGE",
          attachments,
          files: [],
          ts,
        },
      });
    }
    if (subtype === "message_deleted") {
      const { deleted_ts } = message;
      await deleteReactions({ channel_id: channel, ts: deleted_ts });
      await deleteActivity({ channel_id: channel, ts: deleted_ts });
    }
    if (subtype === "file_share") {
      console.log("file_share", message);
      const { text, files, thread_ts } = message;

      await createActivity({
        contact_id: contact.id,
        channel_id: channel,
        details: {
          message: text ?? "",
          source: "SLACK",
          type: thread_ts ? "REPLY" : "MESSAGE",
          attachments: [],
          files:
            files?.map(({ title, url_private }) => ({
              title: title ?? "",
              url: url_private ?? "",
            })) ?? [],
          ts,
        },
        workspace_id,
      });
    }
  }
});

app.event("reaction_added", async ({ body, event }) => {
  const { team_id } = body;
  const { user, item, reaction } = event;
  const { channel, ts } = item;

  if (!team_id) return;

  const contact = await mergeContact({ app, team: team_id, user });
  const workspace_id = contact?.workspace_id;

  if (!workspace_id || !contact) return;

  await createActivity({
    contact_id: contact.id,
    channel_id: channel,
    details: {
      source: "SLACK",
      type: "REACTION",
      message: reaction,
      attachments: [],
      files: [],
      ts,
    },
    workspace_id,
  });
});

app.event("reaction_removed", async ({ event }) => {
  const { reaction } = event;
  const { ts, channel } = event.item;

  await deleteActivity({ channel_id: channel, message: reaction, ts });
});

app.event("user_change", async ({ event }) => {
  const { profile } = event.user;
  const { first_name, last_name, title, phone, image_1024 } = profile;

  await updateContact({
    slack_id: event.user.id,
    first_name,
    last_name,
    job_title: title,
    phone,
    avatar_url: image_1024,
  });
});

app.event("app_uninstalled", async ({ body }) => {
  const { team_id } = body;
  await updateIntegration({ external_id: team_id, status: "DISCONNECTED" });
});

(async () => {
  try {
    await app.start();
    appExpress.listen(port, () => {
      console.log(`SLACK BOT listening on port ${port}`);
    });
    console.log("⚡️ SLACK BOT is running!");
  } catch (error) {
    console.error("Error starting SLACK BOT", error);
  }
})();
