"use server";

import { safeAction } from "@/lib/safeAction";
import { TagSchema } from "@conquest/zod/tag.schema";
import { listTags } from "../queries/listTags";

export const listTagsAction = safeAction
  .metadata({ name: "listTagsAction" })
  .action(async () => {
    const rTags = await listTags();
    const tags = rTags?.data;

    return TagSchema.array().parse(tags);
  });
