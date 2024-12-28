import { sleep } from "@/helpers/sleep";
import type { DiscourseIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import type DiscourseAPI from "discourse2";
import { calculateMemberMetrics } from "../members/calculateMemberMetrics";
import { upsertMember } from "../members/upsertMember";
import { createManyActivities } from "./createManyActivities";
import { createManyInvites } from "./createManyInvites";
import { createManyReactions } from "./createManyReactions";

export const createManyMembers = async ({
  discourse,
  client,
  tags,
}: {
  discourse: DiscourseIntegration;
  client: DiscourseAPI;
  tags: Tag[];
}) => {
  let page = 1;
  let hasMore = true;

  const { workspace_id } = discourse;
  const { community_url } = discourse.details;

  while (hasMore) {
    const users = await client.adminListUsers({
      flag: "active",
      show_emails: true,
      order: "created",
      stats: true,
      page,
    });

    for (const user of users) {
      if (user.id < 1) continue;

      const { id, username, name, avatar_template, email, created_at, title } =
        user;

      if (!email) continue;

      const [firstName, lastName] = name?.split(" ") ?? [];
      const avatarUrl = `${community_url}/${avatar_template.replace(
        "{size}",
        "500",
      )}`;

      const { badges: userBadges } = await client.listUserBadges({
        username,
      });

      const memberTags = tags
        .filter((tag) =>
          userBadges?.some((badge) => badge.id.toString() === tag.external_id),
        )
        .map((tag) => tag.id);

      const member = await upsertMember({
        id: String(id),
        data: {
          first_name: firstName,
          last_name: lastName,
          username,
          primary_email: email,
          phones: [],
          avatar_url: avatarUrl,
          job_title: title,
          tags: memberTags,
          joined_at: new Date(created_at),
          source: "DISCOURSE",
          workspace_id,
        },
      });

      await sleep(500);

      await createManyReactions({
        discourse,
        member,
      });

      await sleep(500);

      await createManyInvites({
        discourse,
        member,
      });

      await sleep(500);

      await createManyActivities({
        client,
        member,
      });

      await sleep(500);

      await calculateMemberMetrics({ member });

      await sleep(2000);
    }

    hasMore = users.length === 100;
    page += 1;
  }
};
