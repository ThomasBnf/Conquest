"use server";

import { prisma } from "@conquest/db/prisma";
import {
  MembersPreferencesSchema,
  WorkspaceSchema,
} from "@conquest/zod/schemas/workspace.schema";
import { authAction } from "lib/authAction";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateWorkspace = authAction
  .metadata({ name: "updateWorkspace" })
  .schema(
    z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      source: z
        .enum(["google", "twitter", "linkedin", "reddit", "youtube", "friend"])
        .optional(),
      company_size: z.string().optional(),
      members_preferences: MembersPreferencesSchema.optional(),
    }),
  )
  .action(
    async ({
      parsedInput: { name, slug, source, company_size, members_preferences },
      ctx,
    }) => {
      const workspace = await prisma.workspaces.update({
        where: {
          id: ctx.user?.workspace_id,
        },
        data: {
          name,
          slug,
          source,
          company_size,
          members_preferences,
        },
      });

      revalidatePath("/");
      return WorkspaceSchema.parse(workspace);
    },
  );
