"use server";

import { createTag as _createTag } from "@conquest/db/queries/tags/createTag";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { TagSchema } from "@conquest/zod/schemas/tag.schema";
import { authAction } from "lib/authAction";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createTag = authAction
  .metadata({
    name: "createTag",
  })
  .schema(
    z.object({
      external_id: z.string().nullable(),
      name: z.string(),
      source: SOURCE,
      color: z.string(),
    }),
  )
  .action(
    async ({ ctx, parsedInput: { external_id, name, source, color } }) => {
      const tag = await _createTag({
        external_id,
        name,
        source,
        color,
        workspace_id: ctx.user.workspace_id,
      });

      revalidatePath(`/${ctx.user.workspace.slug}/settings/tags`);
      return TagSchema.parse(tag);
    },
  );
