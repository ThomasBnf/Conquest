"use server";

import { SOURCE } from "@conquest/zod/source.enum";
import { TagSchema } from "@conquest/zod/tag.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
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
      description: z.string().nullable(),
      source: SOURCE,
      color: z.string(),
    }),
  )
  .action(
    async ({
      ctx,
      parsedInput: { external_id, name, description, source, color },
    }) => {
      const tag = await prisma.tag.create({
        data: {
          external_id,
          name,
          description,
          color,
          source,
          workspace_id: ctx.user.workspace_id,
        },
      });

      revalidatePath(`/${ctx.user.workspace.slug}/settings/tags`);
      return TagSchema.parse(tag);
    },
  );
