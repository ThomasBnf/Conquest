import { env } from "@/env.mjs";
import { type SlackFile, createFiles } from "@/features/slack/helpers/getFiles";
import { prisma } from "@/lib/prisma";
import { createActivity } from "@/queries/activities/createActivity";
import { deleteActivity } from "@/queries/activities/deleteActivity";
import { updateActivity } from "@/queries/activities/updateActivity";
import { getActivityType } from "@/queries/activity-type/getActivityType";
import { createChannel } from "@/queries/channels/createChannel";
import { deleteChannel } from "@/queries/channels/deleteChannel";
import { getChannel } from "@/queries/channels/getChannel";
import { updateChannel } from "@/queries/channels/updateChannel";
import { getIntegration } from "@/queries/integrations/getIntegration";
import { getMember } from "@/queries/members/getMember";
import { upsertMember } from "@/queries/members/upsertMember";
import { deleteListReactions } from "@/queries/slack/deleteListReactions";
import { getAuthUser } from "@/queries/users/getAuthUser";
import {
  type SlackIntegration,
  SlackIntegrationSchema,
} from "@conquest/zod/integration.schema";
import { zValidator } from "@hono/zod-validator";
import {
  type GenericMessageEvent,
  type SlackEvent,
  WebClient,
} from "@slack/web-api";
import { Hono } from "hono";
import { NextResponse } from "next/server";
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

      if (!event || typeof event !== "object") {
        return c.json({ status: 200 });
      }

      if (slack_token !== env.SLACK_TOKEN && api_app_id !== env.SLACK_APP_ID) {
        return c.json({ message: "Unauthorized" }, { status: 401 });
      }

      const { type } = event;

      const rIntegration = await getIntegration({ external_id: team_id });
      const integration = rIntegration?.data as SlackIntegration;

      if (!integration) return NextResponse.json({ status: 200 });

      const { workspace_id } = integration;
      const { token } = integration.details;

      if (!workspace_id || !token) return NextResponse.json({ status: 200 });

      const web = new WebClient(token);

      const type_post = await getActivityType({
        key: "slack:post",
        workspace_id,
      });
      const type_reply = await getActivityType({
        key: "slack:reply",
        workspace_id,
      });
      const type_invitation = await getActivityType({
        key: "slack:invitation",
        workspace_id,
      });
      const type_reaction = await getActivityType({
        key: "slack:reaction",
        workspace_id,
      });

      if (!type_post || !type_reply || !type_invitation || !type_reaction) {
        return c.json({ status: 200 });
      }

      switch (type) {
        case "app_uninstalled": {
          await prisma.integrations.delete({
            where: {
              id: integration.id,
            },
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
          await updateChannel({ external_id: id, name });
          break;
        }

        case "channel_deleted": {
          const { channel } = event;
          await deleteChannel({ external_id: channel });
          break;
        }

        case "message": {
          const { channel: channel_id, subtype } = event;

          const handleMessage = async (messageEvent: GenericMessageEvent) => {
            const { user, text, thread_ts, ts, files } = messageEvent;

            const { profile } = await web.users.profile.get({ user });
            if (!profile) return c.json({ status: 200 });

            const { first_name, last_name, email, phone, image_1024, title } =
              profile;

            const member = await upsertMember({
              id: user,
              source: "SLACK",
              first_name,
              last_name,
              email,
              phone,
              avatar_url: image_1024,
              job_title: title,
              workspace_id,
            });

            const channel = await getChannel({
              external_id: channel_id,
              workspace_id,
            });

            const activity = await createActivity({
              external_id: ts,
              member_id: member.id,
              channel_id: channel.id,
              message: text ?? "",
              activity_type_id: thread_ts ? type_reply.id : type_post.id,
              reply_to: thread_ts ?? null,
              workspace_id,
            });

            await createFiles({
              files: files as SlackFile[],
              activity_id: activity.id,
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
                message: text ?? "",
                activity_type_id: thread_ts ? type_reply.id : type_post.id,
                reply_to: thread_ts ?? null,
              });

              await createFiles({
                files: files as SlackFile[],
                activity_id: activity.id,
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

          const { profile } = await web.users.profile.get({ user });
          if (!profile) return c.json({ status: 200 });

          const { first_name, last_name, email, phone, image_1024, title } =
            profile;

          const member = await upsertMember({
            id: user,
            source: "SLACK",
            first_name,
            last_name,
            email,
            phone,
            avatar_url: image_1024,
            job_title: title,
            workspace_id,
          });

          const channel = await getChannel({
            external_id: channel_id,
            workspace_id,
          });

          if (!type) return c.json({ status: 200 });

          await createActivity({
            external_id: null,
            member_id: member.id,
            channel_id: channel.id,
            activity_type_id: type_reaction.id,
            message: reaction,
            react_to: ts,
            workspace_id,
          });
          break;
        }

        case "reaction_removed": {
          const { user, reaction, item } = event;
          const { ts, channel: channel_id } = item;

          const member = await getMember({
            id: user,
            source: "SLACK",
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
          const { user, inviter, event_ts, channel } = event;

          if (!inviter) break;

          const { profile } = await web.users.profile.get({ user });

          if (!profile) return c.json({ status: 200 });

          const { user: userInfo } = await web.users.info({ user });
          const locale = userInfo?.locale;

          const { first_name, last_name, email, phone, image_1024, title } =
            profile;

          const member = await upsertMember({
            id: user,
            source: "SLACK",
            first_name,
            last_name,
            email,
            phone,
            locale,
            avatar_url: image_1024,
            job_title: title,
            workspace_id,
          });

          const createdChannel = await getChannel({
            external_id: channel,
            workspace_id,
          });

          const currentTimestamp = Math.floor(Number.parseFloat(event_ts));

          const activity = await prisma.activities.findFirst({
            where: {
              member_id: member.id,
              invite_by: inviter,
              AND: [
                {
                  created_at: {
                    gt: new Date((currentTimestamp - 5) * 1000),
                  },
                },
                {
                  created_at: {
                    lt: new Date((currentTimestamp + 5) * 1000),
                  },
                },
              ],
            },
            orderBy: {
              created_at: "desc",
            },
          });

          if (activity) return c.json({ status: 200 });

          const type = await prisma.activities_types.findFirst({
            where: {
              workspace_id,
              key: "slack:invitation",
            },
          });

          if (!type) return c.json({ status: 200 });

          await createActivity({
            external_id: null,
            member_id: member.id,
            channel_id: createdChannel.id,
            message: `<@${inviter}> invited to channel`,
            activity_type_id: type_invitation.id,
            invite_by: inviter,
            created_at: new Date(Number.parseFloat(event_ts) * 1000),
            updated_at: new Date(Number.parseFloat(event_ts) * 1000),
            workspace_id,
          });
          break;
        }

        case "user_change": {
          const { id, deleted } = event.user;

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

          await upsertMember({
            id,
            source: "SLACK",
            first_name,
            last_name,
            email,
            phone,
            locale: userInfo?.locale,
            avatar_url: image_1024,
            job_title: title,
            isDeleted: deleted,
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
