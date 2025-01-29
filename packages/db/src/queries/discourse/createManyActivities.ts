import type { Member } from "@conquest/zod/schemas/member.schema";
import { startOfDay, subDays } from "date-fns";
import type DiscourseAPI from "discourse2";
import { prisma } from "../../prisma";
import { createActivity } from "../activities/createActivity";
import { getActivityType } from "../activity-type/getActivityType";
import { getChannel } from "../channels/getChannel";

type Props = {
  client: DiscourseAPI;
  member: Member;
};

export const createManyActivities = async ({ client, member }: Props) => {
  const { discourse_username, workspace_id } = member;

  const today = startOfDay(new Date());
  const last365Days = subDays(today, 365);

  if (!discourse_username) return;

  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { user_actions } = await client.listUserActions({
      username: discourse_username,
      filter: "1,4,5,6,15",
      offset,
    });

    if (!user_actions?.length) {
      hasMore = false;
      break;
    }

    const recentActions = user_actions.filter(
      (action) => new Date(action.created_at) >= last365Days,
    );

    if (recentActions.length === 0) {
      hasMore = false;
      break;
    }

    for (const action of recentActions) {
      const {
        action_type,
        created_at,
        category_id,
        excerpt,
        post_number,
        post_id,
        topic_id,
        title,
      } = action;

      const channel = category_id
        ? await getChannel({
            external_id: String(category_id),
            workspace_id,
          })
        : null;

      switch (action_type) {
        case 1: {
          const reactTo = post_number === 1 ? `t-${topic_id}` : `p-${post_id}`;

          await createActivity({
            external_id: null,
            activity_type_key: "discourse:reaction",
            message: "like",
            react_to: reactTo,
            thread_id: `t-${topic_id}`,
            member_id: member.id,
            channel_id: channel?.id ?? null,
            created_at: new Date(created_at),
            updated_at: new Date(created_at),
            workspace_id,
          });

          break;
        }
        case 4: {
          if (!channel) continue;

          await createActivity({
            external_id: `t-${topic_id}`,
            activity_type_key: "discourse:topic",
            title,
            message: excerpt,
            thread_id: `t-${topic_id}`,
            member_id: member.id,
            channel_id: channel.id,
            created_at: new Date(created_at),
            updated_at: new Date(created_at),
            workspace_id,
          });

          break;
        }
        case 5: {
          if (!channel || excerpt === "") continue;

          const { reply_to_post_number } = action as {
            reply_to_post_number?: number | null;
          };

          const replyTo =
            reply_to_post_number === null ? null : String(reply_to_post_number);

          const type_reply = await getActivityType({
            workspace_id,
            key: "discourse:reply",
          });

          if (!type_reply) return;

          await prisma.activities.upsert({
            where: {
              external_id_workspace_id: {
                external_id: `p-${post_id}`,
                workspace_id,
              },
            },
            update: {},
            create: {
              external_id: `p-${post_id}`,
              activity_type_id: type_reply.id,
              message: excerpt,
              member_id: member.id,
              reply_to: replyTo,
              thread_id: `t-${topic_id}`,
              channel_id: channel.id,
              created_at,
              workspace_id,
            },
          });
          break;
        }
        case 15: {
          if (!channel || excerpt === "") continue;

          const type_solved = await getActivityType({
            workspace_id,
            key: "discourse:solved",
          });

          if (!type_solved) return;

          const { reply_to_post_number } = action as {
            reply_to_post_number?: number | null;
          };

          const replyTo =
            reply_to_post_number === null
              ? `t-${topic_id}`
              : String(reply_to_post_number);

          await prisma.activities.upsert({
            where: {
              external_id_workspace_id: {
                external_id: `p-${post_id}`,
                workspace_id,
              },
            },
            update: {
              activity_type_id: type_solved.id,
            },
            create: {
              external_id: `p-${post_id}`,
              activity_type_id: type_solved.id,
              message: excerpt,
              member_id: member.id,
              reply_to: replyTo,
              thread_id: `t-${topic_id}`,
              channel_id: channel.id,
              created_at,
              workspace_id,
            },
          });
          break;
        }
      }
    }

    hasMore = user_actions.length === 30;
    offset += 30;
  }
};
