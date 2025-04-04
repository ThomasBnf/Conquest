import { createMember } from "@conquest/clickhouse/members/createMember";
import { getPulseAndLevel } from "@conquest/clickhouse/members/getPulseAndLevel";
import { createProfile } from "@conquest/clickhouse/profiles/createProfile";
import { decrypt } from "@conquest/db/utils/decrypt";
import type { DiscourseIntegration } from "@conquest/zod/schemas/integration.schema";
import { DiscourseProfileSchema } from "@conquest/zod/schemas/profile.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import {
  type AdminListUsers,
  AdminListUsersSchema,
  DirectoryItemsSchema,
} from "@conquest/zod/types/discourse";
import { logger, wait } from "@trigger.dev/sdk/v3";
import { getLocaleByAlpha2 } from "country-locale-map";
import type DiscourseAPI from "discourse2";
import ISO6391 from "iso-639-1";
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
  const { workspace_id, details } = discourse;
  const { community_url, api_key, api_key_iv, user_fields } = details;

  const decryptedApiKey = await decrypt({
    access_token: api_key,
    iv: api_key_iv,
  });

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

    await wait.for({ seconds: 0.5 });
  }

  let _page = 0;
  let _hasMore = true;

  while (_hasMore) {
    const fieldsIds = user_fields?.map((field) => field.id);
    const params = new URLSearchParams({
      period: "all",
      order: "likes_received",
      page: _page.toString(),
    });

    if (fieldsIds?.length) {
      params.set("user_field_ids", fieldsIds.join("|"));
    }

    const url = `${community_url}/directory_items.json?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "Api-Key": decryptedApiKey,
        "Api-Username": "system",
      },
    });

    const data = await response.json();
    const { directory_items } = DirectoryItemsSchema.parse(data);

    for (const item of directory_items ?? []) {
      const {
        id,
        username,
        name,
        avatar_template,
        user_fields = {},
        geo_location,
      } = item.user;

      if (id < 1) continue;

      let language = "";
      let country = "";

      if (typeof geo_location === "object" && geo_location !== null) {
        const { countrycode } = geo_location;

        country = countrycode.toUpperCase();
        const locale = getLocaleByAlpha2(countrycode.toUpperCase());
        const languageCode = locale?.split("_")[0] ?? "";
        language = languageCode ? ISO6391.getName(languageCode) : "";
      }

      const [firstName, lastName] = name?.split(" ") ?? [];
      const avatarUrl = `${community_url}/${avatar_template.replace(
        "{size}",
        "500",
      )}`;

      const { user_badges } = await client.listUserBadges({ username });

      logger.info("user_badges", { username, user_badges });

      const memberTags = tags
        .filter((tag) =>
          user_badges?.some(
            (badge) => String(badge.badge_id) === tag.external_id,
          ),
        )
        .map((tag) => tag.id);

      logger.info("memberTags", { username, memberTags });

      const filteredMember = members.find((member) => member.id === id);

      if (!filteredMember) continue;

      const { email, title, created_at } = filteredMember;

      const custom_fields = Object.entries(user_fields ?? {}).map(
        ([id, field]) => ({
          id,
          value: field?.value?.[0] ?? "",
        }),
      );

      const member = await createMember({
        first_name: firstName,
        last_name: lastName,
        primary_email: email,
        avatar_url: avatarUrl,
        language,
        country,
        job_title: title ?? "",
        tags: memberTags,
        created_at: new Date(created_at),
        source: "Discourse",
        workspace_id,
      });

      const profile = await createProfile({
        external_id: String(id),
        attributes: {
          source: "Discourse",
          username: username,
          custom_fields,
        },
        member_id: member.id,
        created_at: new Date(created_at),
        workspace_id,
      });

      await createManyReactions({
        discourse,
        profile: DiscourseProfileSchema.parse(profile),
      });

      await wait.for({ seconds: 0.5 });

      await createManyInvites({
        discourse,
        profile: DiscourseProfileSchema.parse(profile),
      });

      await wait.for({ seconds: 0.5 });

      await createManyActivities({
        client,
        profile: DiscourseProfileSchema.parse(profile),
      });

      await wait.for({ seconds: 0.5 });

      await getPulseAndLevel({ memberId: member.id });

      await wait.for({ seconds: 3 });
    }

    if (data.directory_items.length < 50) _hasMore = false;
    _page += 1;
  }
};
