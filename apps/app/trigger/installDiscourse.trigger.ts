import { sleep } from "@/helpers/sleep";
import { discourseClient } from "@/lib/discourse";
import { prisma } from "@/lib/prisma";
import { deleteIntegration } from "@/queries/integrations/deleteIntegration";
import { DiscourseIntegrationSchema } from "@conquest/zod/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const installDiscourse = schemaTask({
  id: "install-discourse",
  machine: {
    preset: "small-2x",
  },
  schema: z.object({
    discourse: DiscourseIntegrationSchema,
    community_url: z.string(),
    api_key: z.string(),
  }),
  run: async ({ discourse, community_url, api_key }) => {
    const client = discourseClient({ community_url, api_key });
    const { workspace_id } = discourse;

    await prisma.integrations.update({
      where: { id: discourse.id },
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

    let offset = 0;
    let hasMore = true;
    type UserAction = {
      excerpt: string;
      action_type: number;
      created_at: string;
      avatar_template: string;
      acting_avatar_template: string;
      slug: string;
      topic_id: number;
      target_user_id: number;
      target_name: string | null;
      archived: boolean;
    };

    const actions: UserAction[] = [];

    while (hasMore) {
      const response = await client.listUserActions({
        username: "eloise",
        filter: "1,4,5",
        offset,
      });

      actions.push(...response.user_actions);

      offset += 30;
      await sleep(5000);

      if (response.user_actions.length < 30) {
        hasMore = false;
        break;
      }
    }

    console.log(actions.length);

    // const tags: Tag[] = [];

    // const { badges } = await client.adminListBadges();

    // for (const badge of badges ?? []) {
    //   const createdTag = await prisma.tags.create({
    //     data: {
    //       name: badge.name,
    //       color: badge.badge_type_id.toString(),
    //       source: "DISCOURSE",
    //       workspace_id,
    //       external_id: badge.id.toString(),
    //     },
    //   });

    //   tags.push(createdTag);
    // }

    // const {
    //   category_list: { categories },
    // } = await client.listCategories({
    //   include_subcategories: true,
    // });

    // for (const category of categories ?? []) {
    //   if (category.id !== 28 && category.id !== 29) continue;

    //   const topics = await client.listCategoryTopics({
    //     id: category.id,
    //     slug: category.slug,
    //   });

    //   for (const topic of topics.topic_list.topics ?? []) {
    //     if (topic.id !== 4050) continue;

    //     const posts = await client.getTopic({
    //       id: topic.id.toString(),
    //     });

    //     for (const post of posts.post_stream.posts ?? []) {
    //       console.log(post);
    //     }
    //   }

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

    // let page = 1;
    // let hasMoreUsers = true;
    // const members: Member[] = [];

    // while (hasMoreUsers) {
    //   const users = await client.adminListUsers({
    //     flag: "active",
    //     show_emails: true,
    //     order: "created",
    //     page,
    //   });

    //   for (const user of users) {
    //     const {
    //       id,
    //       username,
    //       name,
    //       avatar_template,
    //       email,
    //       created_at,
    //       title,
    //     } = user;

    //     if (!email) continue;

    //     const firstName = name?.split(" ")[0];
    //     const lastName = name?.split(" ")[1];
    //     const avatarUrl = `${community_url}${avatar_template.replace(
    //       "{size}",
    //       "512",
    //     )}`;

    //     const { badges: userBadges } = await client.listUserBadges({
    //       username,
    //     });

    //     const memberTags = tags
    //       .filter((tag) =>
    //         userBadges?.some(
    //           (badge) => badge.id.toString() === tag.external_id,
    //         ),
    //       )
    //       .map((tag) => tag.id);

    //     const createdMember = await upsertMember({
    //       id: id.toString(),
    //       source: "DISCOURSE",
    //       first_name: firstName ?? "",
    //       last_name: lastName ?? "",
    //       username,
    //       email,
    //       phone: null,
    //       locale: "",
    //       avatar_url: avatarUrl,
    //       job_title: title,
    //       tags: memberTags,
    //       joined_at: new Date(created_at),
    //       workspace_id,
    //     });

    //     members.push(createdMember);

    //     await sleep(1000);
    //   }

    //   hasMoreUsers = users.length === 100;
    //   page += 1;

    //   if (hasMoreUsers) await sleep(5000);
    // }

    // return members;
  },
  onSuccess: async ({ discourse }) => {
    // await updateIntegration({
    //   external_id,
    //   installed_at: new Date(),
    //   status: "INSTALLED",
    // });
    await deleteIntegration({
      source: "DISCOURSE",
      integration: discourse,
    });
  },
  onFailure: async ({ discourse }) => {
    await deleteIntegration({
      source: "DISCOURSE",
      integration: discourse,
    });
  },
});
