import { prisma } from "@/lib/prisma";
import { CustomError } from "@/lib/safeAction";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type DiscourseAPI from "discourse2";
import { getActivityType } from "../activity-type/getActivityType";

type Props = {
  client: DiscourseAPI;
  member: Member;
};

export const createManyActivities = async ({ client, member }: Props) => {
  const { username, workspace_id } = member;

  if (!username) return;

  let offset = 0;
  let hasMore = true;

  const reaction_type = await getActivityType({
    workspace_id,
    key: "discourse:reaction",
  });

  const post_type = await getActivityType({
    workspace_id,
    key: "discourse:post",
  });

  const reply_type = await getActivityType({
    workspace_id,
    key: "discourse:reply",
  });

  const solved_type = await getActivityType({
    workspace_id,
    key: "discourse:solved",
  });

  while (hasMore) {
    const { user_actions } = await client.listUserActions({
      username,
      filter: "1,4,5,6,15",
      offset,
    });

    if (!user_actions?.length) {
      hasMore = false;
      break;
    }

    for (const action of user_actions) {
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

      switch (action_type) {
        case 1: {
          const reactTo = post_number === 1 ? `t-${topic_id}` : `p-${post_id}`;

          await prisma.activities.create({
            data: {
              external_id: null,
              activity_type_id: reaction_type.id,
              message: "like",
              react_to: reactTo,
              thread_id: `t-${topic_id}`,
              member_id: member.id,
              channel_id: null,
              created_at,
              workspace_id,
            },
          });
          break;
        }
        case 4: {
          const channel = await prisma.channels.findFirst({
            where: {
              external_id: String(category_id),
              workspace_id,
            },
          });

          if (!channel) {
            throw new CustomError(`2 Channel not found ${category_id}`, 404);
          }

          await prisma.activities.create({
            data: {
              external_id: `t-${topic_id}`,
              activity_type_id: post_type.id,
              title,
              message: excerpt,
              thread_id: `t-${topic_id}`,
              member_id: member.id,
              channel_id: channel.id,
              created_at,
              workspace_id,
            },
          });
          break;
        }
        case 5: {
          const { reply_to_post_number } = action as {
            reply_to_post_number?: number | null;
          };
          if (excerpt === "") break;

          const channel = await prisma.channels.findFirst({
            where: {
              external_id: String(category_id),
              workspace_id,
            },
          });

          if (!channel) {
            throw new CustomError(`3 Channel not found ${category_id}`, 404);
          }

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
              activity_type_id: reply_type.id,
              message: excerpt,
              member_id: member.id,
              reply_to: String(reply_to_post_number),
              thread_id: `t-${topic_id}`,
              channel_id: channel.id,
              created_at,
              workspace_id,
            },
          });
          break;
        }
        case 15: {
          const { reply_to_post_number } = action as {
            reply_to_post_number?: number | null;
          };
          if (excerpt === "") break;

          const channel = await prisma.channels.findFirst({
            where: {
              external_id: String(category_id),
              workspace_id,
            },
          });

          if (!channel) {
            throw new CustomError(`4 Channel not found ${category_id}`, 404);
          }

          await prisma.activities.upsert({
            where: {
              external_id_workspace_id: {
                external_id: `p-${post_id}`,
                workspace_id,
              },
            },
            update: {
              activity_type_id: solved_type.id,
            },
            create: {
              external_id: `p-${post_id}`,
              activity_type_id: solved_type.id,
              message: excerpt,
              member_id: member.id,
              reply_to: String(reply_to_post_number),
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

    offset += 30;
    hasMore = user_actions.length === 30;
  }
};
