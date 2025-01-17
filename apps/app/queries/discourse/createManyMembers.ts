import { calculateMemberMetrics } from "@/client/dashboard/calculateMemberMetrics";
import { sleep } from "@/helpers/sleep";
import type { DiscourseIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import {
  type AdminListUsers,
  AdminListUsersSchema,
  DirectoryItemsSchema,
} from "@conquest/zod/types/discourse";
import { getLocaleByAlpha2 } from "country-locale-map";
import type DiscourseAPI from "discourse2";
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
  const { workspace_id } = discourse;
  const { community_url, api_key, user_fields } = discourse.details;

  let members: AdminListUsers[] = [];

  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const listOfUsers = await client.adminListUsers({
      flag: "active",
      show_emails: true,
      order: "created",
      asc: "true",
      page,
    });

    const parsedListOfUsers = AdminListUsersSchema.array().parse(listOfUsers);

    if (parsedListOfUsers.length < 100) hasMore = false;

    members = [...members, ...parsedListOfUsers];
    page += 1;

    await sleep(500);
  }

  let _page = 0;
  let _hasMore = true;

  while (_hasMore) {
    const fieldsIds = user_fields?.map((field) => field.id);
    const params = new URLSearchParams({
      period: "all",
      order: "likes_received",
      user_field_ids: fieldsIds?.join("|") ?? "",
      page: _page.toString(),
    });

    const url = `${community_url}/directory_items.json?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "Api-Key": api_key,
        "Api-Username": "system",
      },
    });

    const data = await response.json();
    console.dir(data, { depth: 100 });
    const parsedReponse = DirectoryItemsSchema.parse(data);
    const { directory_items } = parsedReponse;

    for (const item of directory_items) {
      let locale: string | null = null;
      const { id, username, name, avatar_template, user_fields, geo_location } =
        item.user;

      if (id < 1) continue;

      if (typeof geo_location === "object" && geo_location !== null) {
        const country =
          "countrycode" in geo_location ? geo_location.countrycode : null;

        if (country) {
          locale = getLocaleByAlpha2(country.toUpperCase()) ?? null;
        }
      }

      const [firstName, lastName] = name?.split(" ") ?? [];
      const avatarUrl = `${community_url}/${avatar_template.replace(
        "{size}",
        "500",
      )}`;

      const { user_badges } = await client.listUserBadges({ username });

      const memberTags = tags
        .filter((tag) =>
          user_badges?.some((badge) => String(badge.id) === tag.external_id),
        )
        .map((tag) => tag.id);

      const filteredMember = members.find((member) => member.id === id);

      if (!filteredMember) continue;

      const { email, title, created_at } = filteredMember;

      const custom_fields = Object.entries(user_fields).map(([id, value]) => ({
        id,
        value,
      }));

      const member = await upsertMember({
        id: String(id),
        data: {
          first_name: firstName,
          last_name: lastName,
          username,
          primary_email: email,
          phones: [],
          locale,
          avatar_url: avatarUrl,
          job_title: title,
          tags: memberTags,
          custom_fields,
          source: "DISCOURSE",
          created_at: new Date(created_at),
          workspace_id,
        },
      });

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

      await sleep(2500);
    }

    if (data.directory_items.length < 50) _hasMore = false;
    _page += 1;
  }
};
