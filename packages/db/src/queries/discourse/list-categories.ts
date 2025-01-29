import type DiscourseAPI from "discourse2";
import { prisma } from "../../prisma";

type Props = {
  client: DiscourseAPI;
  workspace_id: string;
};

export const listCategories = async ({ client, workspace_id }: Props) => {
  const { categories } = await client.getSite();

  for (const category of categories) {
    const { id, name, slug } = category;

    if (!category.parent_category_id) {
      await prisma.channels.create({
        data: {
          external_id: String(id),
          name: name ?? "",
          slug: slug ?? "",
          source: "DISCOURSE",
          workspace_id,
        },
      });

      continue;
    }

    const parent = categories.find(
      (parent) => parent.id === category.parent_category_id,
    );

    if (!parent) continue;

    if (!parent.parent_category_id) {
      await prisma.channels.create({
        data: {
          external_id: String(id),
          name: `${parent.name} - ${name}`,
          slug,
          source: "DISCOURSE",
          workspace_id,
        },
      });

      continue;
    }

    const grandParent = categories.find(
      (grandParent) => grandParent.id === parent.parent_category_id,
    );

    if (!grandParent) continue;

    await prisma.channels.create({
      data: {
        external_id: String(id),
        name: `${grandParent.name} - ${parent.name} - ${name}`,
        slug,
        source: "DISCOURSE",
        workspace_id,
      },
    });
  }
};
