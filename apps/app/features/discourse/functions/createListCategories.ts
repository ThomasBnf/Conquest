import { createChannel } from "@/features/channels/functions/createChannel";
import { safeAction } from "@/lib/safeAction";
import ky from "ky";
import { z } from "zod";

const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  read_restricted: z.boolean(),
});

const CategoryListSchema = z.object({
  category_list: z.object({
    categories: z.array(CategorySchema),
  }),
});

export const createListCategories = safeAction
  .metadata({
    name: "createListCategories",
  })
  .schema(
    z.object({
      workspace_id: z.string().cuid(),
      token: z.string(),
    }),
  )
  .action(async ({ parsedInput: { workspace_id, token } }) => {
    let hasMore = true;
    do {
      const categories = await ky
        .get("https://playground.lagrowthmachine.com/categories", {
          headers: {
            "Api-Key": token,
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
        console.log(category);
        const { id, name } = CategorySchema.parse(category);
        await createChannel({
          external_id: id.toString(),
          name,
          source: "DISCOURSE",
          workspace_id,
        });
      }

      hasMore = categories?.length > 0;
    } while (hasMore);
  });
