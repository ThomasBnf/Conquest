import { sleep } from "@/helpers/sleep";
import { prisma } from "@/lib/prisma";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { ReponseListTopics } from "@conquest/zod/schemas/types/discourse/index";
import { getMember } from "../members/getMember";

type Props = {
  community_url: string;
  api_key: string;
  channel: Channel;
  type_post: string;
};

export const listTopics = async ({
  community_url,
  api_key,
  channel,
  type_post,
}: Props) => {
  const { external_id, slug } = channel;

  if (!slug) return [];

  const response = await fetch(
    `${community_url}/c/${slug}/${external_id}.json`,
    {
      method: "GET",
      headers: {
        "Api-Key": api_key,
        "Api-Username": "system",
      },
    },
  );

  const topicsData = (await response.json()) as ReponseListTopics;
  const { topic_list } = topicsData;

  for (const topic of topic_list.topics) {
    const { id, title, created_at, posters } = topic;

    const userId = posters.find((poster) => poster.description)?.user_id;

    const member = await getMember({
      id: String(userId),
      source: "DISCOURSE",
      workspace_id: channel.workspace_id,
    });

    if (!member) continue;

    await prisma.activities.create({
      data: {
        external_id: String(id),
        activity_type_id: type_post,
        message: title,
        channel_id: channel.id,
        member_id: member.id,
        created_at: new Date(created_at),
        updated_at: new Date(created_at),
        workspace_id: member.workspace_id,
      },
    });
  }

  let page = 0;
  let hasMore = !!topic_list.more_topics_url;

  while (hasMore) {
    const response = await fetch(
      `${community_url}/c/${slug}/${external_id}.json?page=${page}`,
      {
        method: "GET",
        headers: {
          "Api-Key": api_key,
          "Api-Username": "system",
        },
      },
    );

    const pageData = (await response.json()) as ReponseListTopics;
    const pageTopics = pageData.topic_list.topics;

    for (const topic of pageTopics) {
      const { id, title, created_at, posters } = topic;

      const userId = posters.find((poster) => poster.description)?.user_id;

      const member = await getMember({
        id: String(userId),
        source: "DISCOURSE",
        workspace_id: channel.workspace_id,
      });

      if (!member) continue;

      await prisma.activities.create({
        data: {
          external_id: String(id),
          activity_type_id: type_post,
          message: title,
          channel_id: channel.id,
          member_id: member.id,
          created_at: new Date(created_at),
          updated_at: new Date(created_at),
          workspace_id: member.workspace_id,
        },
      });

      await sleep(200);
    }

    if (pageTopics.length < 30) {
      hasMore = false;
      break;
    }

    page++;
  }
};
