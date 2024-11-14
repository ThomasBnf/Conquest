import { upsertMember } from "@/features/members/functions/upsertMember";
import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import ky from "ky";
import { z } from "zod";

const MemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  username: z.string(),
  title: z.string().nullable(),
  avatar_template: z.string(),
  created_at: z.coerce.date(),
});

const UserBadgeSchema = z.object({
  id: z.number(),
  badge_id: z.number(),
});

const BadgesSchema = z.object({
  user_badges: z.array(UserBadgeSchema),
});

export const createListMembers = safeAction
  .metadata({
    name: "createListMembers",
  })
  .schema(
    z.object({
      api_key: z.string(),
      community_url: z.string(),
      workspace_id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { api_key, community_url, workspace_id } }) => {
    let page = 0;
    let hasMore = true;

    const tags = await prisma.tag.findMany({ where: { workspace_id } });

    do {
      const members = await ky
        .get(`${community_url}/admin/users/list/active`, {
          headers: {
            "Api-Key": api_key,
            "Api-Username": "system",
            Accept: "application/json",
          },
          searchParams: {
            show_emails: true,
            stats: true,
            page,
          },
        })
        .json<Record<string, unknown>[]>();

      for (const member of members ?? []) {
        const {
          id,
          name,
          email,
          username,
          title,
          avatar_template,
          created_at,
        } = MemberSchema.parse(member);

        const badges = await ky
          .get(`${community_url}/user-badges/${username}`, {
            headers: {
              "Api-Key": api_key,
              "Api-Username": "system",
              Accept: "application/json",
            },
            searchParams: {
              show_emails: true,
              stats: true,
              page,
            },
          })
          .json<Record<string, unknown>[]>();

        const parsedBadges = BadgesSchema.parse(badges);
        const userTags = tags
          .filter((tag) =>
            parsedBadges.user_badges.some(
              (badge) => badge.badge_id === Number(tag.external_id),
            ),
          )
          .map((tag) => tag.id);

        await upsertMember({
          id: id.toString(),
          source: "DISCOURSE",
          first_name: name.split(" ")[0],
          last_name: name.split(" ").slice(1).join(" "),
          full_name: name,
          username: username,
          email: email,
          job_title: title,
          avatar_url: avatar_template,
          tags: userTags,
          joined_at: created_at,
          deleted: false,
          workspace_id,
        });
      }

      page++;
      hasMore = members?.length > 0;
    } while (hasMore);
  });
