import { safeAction } from "@/lib/safeAction";
import ky from "ky";
import { z } from "zod";

const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  read_restricted: z.boolean(),
});

const CategoryListSchema = z.object({
  category_list: z.object({
    categories: z.array(CategorySchema),
  }),
});

const TopicListSchema = z.object({
  topic_list: z.object({
    topics: z.array(z.any()),
  }),
});

export const createListCategories = safeAction
  .metadata({
    name: "createListCategories",
  })
  .schema(
    z.object({
      api_key: z.string(),
      community_url: z.string(),
      workspace_id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { api_key, community_url, workspace_id } }) => {
    let hasMore = true;
    do {
      const categories = await ky
        .get(`${community_url}/categories`, {
          headers: {
            "Api-Key": api_key,
            "Api-Username": "system",
            Accept: "application/json",
          },
          searchParams: {
            include_subcategories: true,
          },
        })
        .json<Record<string, unknown>[]>();

      const { category_list } = CategoryListSchema.parse(categories);
      const filteredCategories = category_list.categories.filter(
        (category) => !category.read_restricted,
      );

      for (const category of filteredCategories ?? []) {
        const { id, name, slug } = CategorySchema.parse(category);
        // await createChannel({
        //   external_id: id.toString(),
        //   name,
        //   source: "DISCOURSE",
        //   workspace_id,
        // });

        const result = await ky
          .get(`${community_url}/c/${slug}/${id}`, {
            headers: {
              "Api-Key": api_key,
              "Api-Username": "system",
              Accept: "application/json",
            },
          })
          .json<Record<string, unknown>[]>();

        const topics = TopicListSchema.parse(result).topic_list.topics;
      }

      hasMore = categories?.length > 0;
    } while (hasMore);
  });
