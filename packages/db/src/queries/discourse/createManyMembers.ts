import type { DiscourseIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Level } from "@conquest/zod/schemas/level.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { DiscourseProfileSchema } from "@conquest/zod/schemas/profile.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import {
  type AdminListUsers,
  AdminListUsersSchema,
  DirectoryItemsSchema,
} from "@conquest/zod/types/discourse";
import { wait } from "@trigger.dev/sdk/v3";
import { getLocaleByAlpha2 } from "country-locale-map";
import type DiscourseAPI from "discourse2";
import ISO6391 from "iso-639-1";
import { createMember } from "../member/createMember";
import { getMembersMetrics } from "../member/getMembersMetrics";
import { upsertProfile } from "../profile/upsertProfile";
import { createManyActivities } from "./createManyActivities";
import { createManyInvites } from "./createManyInvites";
import { createManyReactions } from "./createManyReactions";

export const createManyMembers = async ({
  discourse,
  client,
  tags,
  levels,
}: {
  discourse: DiscourseIntegration;
  client: DiscourseAPI;
  tags: Tag[];
  levels: Level[];
}) => {
  const { workspace_id } = discourse;
  const { community_url, api_key, user_fields } = discourse.details;

  let members: AdminListUsers[] = [];
  const createdMembers: Member[] = [];

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
        "Api-Key": api_key,
        "Api-Username": "system",
      },
    });

    const data = await response.json();
    const parsedReponse = DirectoryItemsSchema.parse(data);
    const { directory_items } = parsedReponse;

    for (const item of directory_items ?? []) {
      const { id, username, name, avatar_template, user_fields, geo_location } =
        item.user;

      if (id < 1) continue;

      let language: string | null = null;
      let country: string | null = null;

      if (typeof geo_location === "object" && geo_location !== null) {
        const { countrycode } = geo_location;

        country = countrycode.toUpperCase();
        const locale = getLocaleByAlpha2(countrycode.toUpperCase());
        const languageCode = locale?.split("_")[0] ?? "";
        language = languageCode ? ISO6391.getName(languageCode) : null;
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

      const custom_fields = Object.entries(user_fields ?? {}).map(
        ([id, field]) => ({
          id,
          value: field.value[0] ?? "",
        }),
      );

      const member = await createMember({
        data: {
          first_name: firstName,
          last_name: lastName,
          primary_email: email,
          avatar_url: avatarUrl,
          language,
          country,
          job_title: title,
          tags: memberTags,
          created_at: new Date(created_at),
        },
        source: "DISCOURSE",
        workspace_id,
      });

      const profile = await upsertProfile({
        external_id: String(id),
        attributes: {
          source: "DISCOURSE",
          username: username,
          custom_fields,
        },
        member_id: member.id,
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

      await getMembersMetrics({ members: [member], levels });

      createdMembers.push(member);

      await wait.for({ seconds: 2.5 });
    }

    if (data.directory_items.length < 50) _hasMore = false;
    _page += 1;
  }

  return createdMembers;
};
