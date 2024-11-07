import { upsertMember } from "@/features/members/functions/upsertMember";
import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import ky from "ky";
import { z } from "zod";
import { BadgeSchema } from "./createListTags";

const MemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  username: z.string(),
  title: z.string().nullable(),
  avatar_template: z.string(),
  created_at: z.coerce.date(),
});

export const createListMembers = safeAction
  .metadata({
    name: "createListMembers",
  })
  .schema(
    z.object({
      workspace_id: z.string().cuid(),
      token: z.string(),
    }),
  )
  .action(async ({ parsedInput: { workspace_id, token } }) => {
    let page = 0;
    let hasMore = true;

    const tags = await prisma.tag.findMany({ where: { workspace_id } });

    do {
      const members = await ky
        .get("https://playground.lagrowthmachine.com/admin/users/list/active", {
          headers: {
            "Api-Key": token,
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
          .get(
            `https://playground.lagrowthmachine.com/user-badges/${username}`,
            {
              headers: {
                "Api-Key": token,
                "Api-Username": "system",
                Accept: "application/json",
              },
              searchParams: {
                show_emails: true,
                stats: true,
                page,
              },
            },
          )
          .json<Record<string, unknown>[]>();

        const parsedBadges = BadgeSchema.array().parse(badges);

        const userTags = tags.filter((tag) =>
          badges.some((badge) => badge.tag_id === tag.external_id),
        );

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
          joined_at: created_at,
          deleted: false,
          workspace_id,
        });
      }

      page++;
      hasMore = members?.length > 0;
    } while (hasMore);
  });
