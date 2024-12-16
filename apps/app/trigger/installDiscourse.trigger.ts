import { sleep } from "@/helpers/sleep";
import { discourseClient } from "@/lib/discourse";
import { prisma } from "@/lib/prisma";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { upsertMember } from "@/queries/members/upsertMember";
import { DiscourseIntegrationSchema } from "@conquest/zod/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const installDiscourse = schemaTask({
  id: "install-discourse",
  machine: {
    preset: "small-2x",
  },
  schema: z.object({
    integration: DiscourseIntegrationSchema,
    community_url: z.string(),
    api_key: z.string(),
  }),
  run: async ({ integration, community_url, api_key }) => {
    const discourse = discourseClient({ community_url, api_key });
    const workspace_id = integration.workspace_id;

    await prisma.integrations.update({
      where: { id: integration.id },
      data: {
        details: {
          source: "DISCOURSE",
          community_url,
          api_key,
          signature: "",
        },
        status: "SYNCING",
      },
    });

    const tags: Tag[] = [];

    const { badges } = await discourse.adminListBadges();

    for (const badge of badges ?? []) {
      const createdTag = await prisma.tags.create({
        data: {
          name: badge.name,
          color: badge.badge_type_id.toString(),
          source: "DISCOURSE",
          workspace_id: integration.workspace_id,
          external_id: badge.id.toString(),
        },
      });

      tags.push(createdTag);
    }

    // const {
    //   category_list: { categories },
    // } = await discourse.listCategories({
    //   include_subcategories: true,
    // });

    // for (const category of categories ?? []) {
    //   await prisma.channels.create({
    //     data: {
    //       name: category.name ?? "",
    //       source: "DISCOURSE",
    //       workspace_id: integration.workspace_id,
    //       external_id: category.id.toString(),
    //     },
    //   });

    //   for (const subcategory of category.subcategory_list ?? []) {
    //     type SubCategory = { name: string; id: number };
    //     const typedSubcategory = subcategory as SubCategory;

    //     await prisma.channels.create({
    //       data: {
    //         name: `${category.name} - ${typedSubcategory.name}`,
    //         source: "DISCOURSE",
    //         workspace_id: integration.workspace_id,
    //         external_id: typedSubcategory.id.toString(),
    //       },
    //     });
    //   }
    // }

    let page = 1;
    let hasMoreUsers = true;
    const members: Member[] = [];

    while (hasMoreUsers) {
      const users = await discourse.adminListUsers({
        flag: "active",
        show_emails: true,
        order: "created",
        page,
      });

      for (const user of users) {
        const {
          id,
          username,
          name,
          avatar_template,
          email,
          created_at,
          title,
        } = user;

        if (!email) continue;

        const firstName = name?.split(" ")[0];
        const lastName = name?.split(" ")[1];
        const avatarUrl = `${community_url}${avatar_template.replace(
          "{size}",
          "512",
        )}`;

        const { badges: userBadges } = await discourse.listUserBadges({
          username,
        });

        const memberTags = tags
          .filter((tag) =>
            userBadges?.some(
              (badge) => badge.id.toString() === tag.external_id,
            ),
          )
          .map((tag) => tag.id);

        const createdMember = await upsertMember({
          id: id.toString(),
          source: "DISCOURSE",
          first_name: firstName ?? "",
          last_name: lastName ?? "",
          username,
          email,
          phone: null,
          locale: "",
          avatar_url: avatarUrl,
          job_title: title,
          tags: memberTags,
          joined_at: new Date(created_at),
          workspace_id,
        });

        members.push(createdMember);

        await sleep(1000);
      }

      hasMoreUsers = users.length === 100;
      page += 1;

      if (hasMoreUsers) await sleep(5000);
    }

    return members;
  },
  onSuccess: async ({ integration }) => {
    // await updateIntegration({
    //   external_id,
    //   installed_at: new Date(),
    //   status: "INSTALLED",
    // });
    await deleteIntegration({
      source: "DISCOURSE",
      integration,
    });
  },
  onFailure: async ({ integration }) => {
    await deleteIntegration({
      source: "DISCOURSE",
      integration,
    });
  },
});
