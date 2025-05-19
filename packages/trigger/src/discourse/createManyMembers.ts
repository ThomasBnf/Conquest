import { createMember } from "@conquest/clickhouse/member/createMember";
import { getPulseAndLevel } from "@conquest/clickhouse/member/getPulseAndLevel";
import { createProfile } from "@conquest/clickhouse/profile/createProfile";
import { decrypt } from "@conquest/db/utils/decrypt";
import type { DiscourseIntegration } from "@conquest/zod/schemas/integration.schema";
import { DiscourseProfileSchema } from "@conquest/zod/schemas/profile.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import {
  AdminListUsersSchema,
  DirectoryItemsSchema,
  User,
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
  const { workspaceId, details } = discourse;
  const { communityUrl, apiKey, apiKeyIv, userFields } = details;

  const decryptedApiKey = await decrypt({
    accessToken: apiKey,
    iv: apiKeyIv,
  });

  let members: User[] = [];

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

    const parsedListOfUsers = AdminListUsersSchema.parse(listOfUsers);
    logger.info("parsedListOfUsers", { parsedListOfUsers });
    const { users } = parsedListOfUsers;

    if (users.length < 100) hasMore = false;

    members = [...members, ...users];
    page += 1;

    await wait.for({ seconds: 1.5 });
  }

  let _page = 0;
  let _hasMore = true;

  while (_hasMore) {
    const fieldsIds = userFields?.map((field) => field.id);
    const params = new URLSearchParams({
      period: "all",
      order: "likes_received",
      page: _page.toString(),
    });

    if (fieldsIds?.length) {
      params.set("user_field_ids", fieldsIds.join("|"));
    }

    const url = `${communityUrl}/directory_items.json?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        "Api-Key": decryptedApiKey,
        "Api-Username": "system",
      },
    });

    const data = await response.json();
    logger.info("directory_items", { data });
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
      const avatarUrl = `${communityUrl}/${avatar_template.replace(
        "{size}",
        "500",
      )}`;

      const { user_badges } = await client.listUserBadges({ username });

      logger.info("user_badges", { username, user_badges });

      const memberTags = tags
        .filter((tag) =>
          user_badges?.some(
            (badge) => String(badge.badge_id) === tag.externalId,
          ),
        )
        .map((tag) => tag.id);

      logger.info("memberTags", { username, memberTags });

      const filteredMember = members.find((member) => member.id === id);

      if (!filteredMember) continue;

      const { email, title, created_at } = filteredMember;

      const customFields = Object.entries(user_fields ?? {}).map(
        ([id, field]) => ({
          id,
          value: field?.value?.[0] ?? "",
        }),
      );

      const member = await createMember({
        firstName,
        lastName,
        primaryEmail: email,
        emails: email ? [email] : [],
        avatarUrl,
        language,
        country,
        jobTitle: title ?? "",
        tags: memberTags,
        createdAt: new Date(created_at),
        source: "Discourse",
        workspaceId,
      });

      const profile = await createProfile({
        externalId: String(id),
        attributes: {
          source: "Discourse",
          username: username,
          customFields,
        },
        memberId: member.id,
        createdAt: new Date(created_at),
        workspaceId,
      });

      await createManyReactions({
        discourse,
        profile: DiscourseProfileSchema.parse(profile),
      });

      await wait.for({ seconds: 1 });

      await createManyInvites({
        discourse,
        profile: DiscourseProfileSchema.parse(profile),
      });

      await wait.for({ seconds: 1 });

      await createManyActivities({
        client,
        profile: DiscourseProfileSchema.parse(profile),
      });

      await wait.for({ seconds: 1 });

      await getPulseAndLevel({ memberId: member.id });

      await wait.for({ seconds: 5 });
    }

    if (data.directory_items.length < 50) _hasMore = false;
    _page += 1;
  }
};
