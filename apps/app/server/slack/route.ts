import { getAuthUser } from "@/queries/getAuthUser";
import { prisma } from "@conquest/db/prisma";
import { createActivity } from "@conquest/db/queries/activities/createActivity";
import { deleteActivity } from "@conquest/db/queries/activities/deleteActivity";
import { updateActivity } from "@conquest/db/queries/activities/updateActivity";
import { upsertActivity } from "@conquest/db/queries/activities/upsertActivity";
import { createChannel } from "@conquest/db/queries/channels/createChannel";
import { deleteChannel } from "@conquest/db/queries/channels/deleteChannel";
import { getChannel } from "@conquest/db/queries/channels/getChannel";
import { updateChannel } from "@conquest/db/queries/channels/updateChannel";
import { getIntegration } from "@conquest/db/queries/integrations/getIntegration";
import { updateIntegration } from "@conquest/db/queries/integrations/updateIntegration";
import { checkMerging } from "@conquest/db/queries/members/checkMerging";
import { getMember } from "@conquest/db/queries/members/getMember";
import { upsertMember } from "@conquest/db/queries/members/upsertMember";
import {
  type SlackFile,
  createFiles,
} from "@conquest/db/queries/slack/createFiles";
import { deleteListReactions } from "@conquest/db/queries/slack/deleteListReactions";
import { env } from "@conquest/env";
import { updateMemberMetrics } from "@conquest/trigger/tasks/updateMemberMetrics.trigger";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { zValidator } from "@hono/zod-validator";
import {
  type GenericMessageEvent,
  type SlackEvent,
  WebClient,
} from "@slack/web-api";
import { Hono } from "hono";
import { z } from "zod";

export const slack = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        token: z.string(),
        api_app_id: z.string(),
        team_id: z.string(),
        event: z.custom<SlackEvent>(),
      }),
    ),
    async (c) => {
      const {
        token: slack_token,
        api_app_id,
        team_id,
        event,
      } = c.req.valid("json");

      if (!event || typeof event !== "object") return c.json({ status: 200 });

      if (
        slack_token !== env.SLACK_VERIFICATION_TOKEN &&
        api_app_id !== env.SLACK_APP_ID
      ) {
        return c.json({ status: 200 });
      }

      const { type } = event;

      const integration = await getIntegration({
        external_id: team_id,
        status: "CONNECTED",
      });

      if (!integration) return c.json({ status: 200 });

      const slackIntegration = SlackIntegrationSchema.parse(integration);

      const { workspace_id } = slackIntegration;
      const { token } = slackIntegration.details;

      if (!workspace_id || !token) return c.json({ status: 200 });

      const web = new WebClient(token);

      switch (type) {
        case "app_uninstalled": {
          await updateIntegration({
            id: integration.id,
            status: "DISCONNECTED",
          });

          break;
        }

        case "channel_created": {
          const { name, id } = event.channel;

          await createChannel({
            name,
            external_id: id,
            source: "SLACK",
            workspace_id,
          });

          await web.conversations.join({ channel: id });
          break;
        }

        case "channel_rename": {
          const { name, id } = event.channel;
          await updateChannel({ external_id: id, name, workspace_id });
          break;
        }

        case "channel_deleted": {
          const { channel } = event;
          await deleteChannel({ external_id: channel, workspace_id });
          break;
        }

        case "message": {
          const { channel: channel_id, subtype } = event;

          const handleMessage = async (messageEvent: GenericMessageEvent) => {
            const { user, text, thread_ts, ts, files } = messageEvent;

            const member = await getMember({
              slack_id: user,
              workspace_id,
            });

            if (!member) return c.json({ status: 200 });

            const channel = await getChannel({
              external_id: channel_id,
              workspace_id,
            });

            const activity = await createActivity({
              external_id: ts,
              activity_type_key: thread_ts ? "slack:reply" : "slack:post",
              member_id: member.id,
              channel_id: channel.id,
              message: text ?? "",
              reply_to: thread_ts ?? null,
              workspace_id,
            });

            await updateMemberMetrics.trigger({ member });

            await createFiles({
              files: files as SlackFile[],
              activity_id: activity?.id,
            });
          };

          switch (subtype) {
            case undefined:

            case "file_share": {
              await handleMessage(event as GenericMessageEvent);
              break;
            }

            case "message_changed": {
              const { text, ts, thread_ts, files } =
                event.message as GenericMessageEvent;

              const activity = await updateActivity({
                external_id: ts,
                activity_type_key: thread_ts ? "slack:reply" : "slack:post",
                message: text ?? "",
                reply_to: thread_ts ?? null,
                workspace_id,
              });

              await createFiles({
                files: files as SlackFile[],
                activity_id: activity?.id,
              });

              break;
            }

            case "message_deleted": {
              const { deleted_ts } = event;
              const channel = await getChannel({
                external_id: channel_id,
                workspace_id,
              });

              await deleteListReactions({
                channel_id: channel.id,
                react_to: deleted_ts,
              });

              await deleteActivity({
                external_id: deleted_ts,
                channel_id: channel.id,
                workspace_id,
              });

              break;
            }
          }
          break;
        }

        case "reaction_added": {
          const { user, item, reaction } = event;
          const { channel: channel_id, ts } = item;

          const member = await getMember({
            slack_id: user,
            workspace_id,
          });

          if (!member) return c.json({ status: 200 });

          const channel = await getChannel({
            external_id: channel_id,
            workspace_id,
          });

          await createActivity({
            external_id: null,
            activity_type_key: "slack:reaction",
            member_id: member.id,
            channel_id: channel.id,
            message: reaction,
            react_to: ts,
            workspace_id,
          });

          await updateMemberMetrics.trigger({ member });

          break;
        }

        case "reaction_removed": {
          const { user, reaction, item } = event;
          const { ts, channel: channel_id } = item;

          const member = await getMember({
            slack_id: user,
            workspace_id,
          });

          if (!member) return c.json({ status: 200 });

          const channel = await getChannel({
            external_id: channel_id,
            workspace_id,
          });

          await prisma.activities.deleteMany({
            where: {
              member_id: member.id,
              channel_id: channel.id,
              AND: [
                {
                  react_to: ts,
                },
                {
                  message: reaction,
                },
              ],
            },
          });

          break;
        }

        case "member_joined_channel": {
          const { user, inviter, event_ts } = event;

          if (!inviter) break;

          const response = await web.users.profile.get({ user });
          const profile = response.profile;

          if (!profile) return c.json({ status: 200 });

          const { user: userInfo } = await web.users.info({ user });

          const locale = userInfo?.locale?.replace("-", "_");

          const { first_name, last_name, email, phone, image_1024, title } =
            profile;

          if (!email) return c.json({ status: 200 });

          const existingMember = await getMember({
            slack_id: user,
            workspace_id,
          });

          if (existingMember) return c.json({ status: 200 });

          const member = await upsertMember({
            id: user,
            data: {
              first_name,
              last_name,
              primary_email: email,
              phones: phone ? [phone] : [],
              locale,
              avatar_url: image_1024,
              job_title: title,
            },
            source: "SLACK",
            workspace_id,
          });

          if (!member) return c.json({ status: 200 });

          const inviterMember = await getMember({
            slack_id: inviter,
            workspace_id,
          });

          if (!inviterMember) return c.json({ status: 200 });

          await upsertActivity({
            external_id: user,
            activity_type_key: "slack:invitation",
            message: `<@${member.slack_id}> accepted your invitation`,
            data: {
              invite_to: member.id,
              created_at: new Date(Number.parseFloat(event_ts) * 1000),
              updated_at: new Date(Number.parseFloat(event_ts) * 1000),
            },
            member_id: inviterMember.id,
            workspace_id,
          });

          await upsertActivity({
            external_id: inviter,
            activity_type_key: "slack:join",
            message: "Has joined the community",
            member_id: member.id,
            workspace_id,
          });

          await updateMemberMetrics.trigger({ member: inviterMember });
          await checkMerging({ member_id: member.id, workspace_id });

          break;
        }

        case "user_change": {
          const { id, deleted } = event.user;

          if (deleted) {
            const member = await getMember({
              slack_id: id,
              workspace_id,
            });

            if (!member) return c.json({ status: 200 });

            await prisma.members.delete({
              where: {
                id: member.id,
                slack_id: id,
                workspace_id,
              },
            });

            return c.json({ status: 200 });
          }

          const userProfile = await web.users.profile
            .get({ user: id })
            .catch(() => {
              return { profile: undefined };
            });

          const profile = userProfile.profile;
          if (!profile) return c.json({ status: 200 });

          const { user: userInfo } = await web.users.info({ user: id });
          const { first_name, last_name, email, phone, image_1024, title } =
            profile;

          if (!email) return c.json({ status: 200 });

          await upsertMember({
            id,
            data: {
              first_name,
              last_name,
              primary_email: email,
              phones: phone ? [phone] : [],
              locale: userInfo?.locale?.replace("-", "_"),
              avatar_url: image_1024,
              job_title: title,
            },
            source: "SLACK",
            workspace_id,
          });

          break;
        }
      }

      return c.json({ status: 200 });
    },
  )
  .get("/channels", async (c) => {
    const user = await getAuthUser(c);

    const { workspace_id } = user;

    const slack = SlackIntegrationSchema.parse(
      await prisma.integrations.findFirst({
        where: {
          workspace_id,
          details: {
            path: ["source"],
            equals: "SLACK",
          },
        },
      }),
    );

    const { token, slack_user_token } = slack.details;

    if (!token || !slack_user_token) return c.json([]);

    const web = new WebClient(token);

    const { channels } = await web.conversations.list({
      types: "public_channel,private_channel",
      exclude_archived: true,
    });

    return c.json(channels);
  });
