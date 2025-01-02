"use server";

import { APIKeySchema } from "@conquest/zod/schemas/apikey.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createApiKey = authAction
  .metadata({ name: "createApiKey" })
  .schema(
    z.object({
      name: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { name } }) => {
    const slug = ctx.user.workspace.slug;
    const workspace_id = ctx.user.workspace_id;

    const apiKey = await prisma.apikeys.create({
      data: {
        name,
        token: await generateId(24),
        workspace_id,
      },
    });

    revalidatePath(`/${slug}/settings/api`);
    return APIKeySchema.parse(apiKey);
  });

export const generateId = async (idDesiredLength: number): Promise<string> => {
  const getRandomCharFromAlphabet = (alphabet: string): string => {
    return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  };

  return Array.from({ length: idDesiredLength })
    .map(() => {
      return getRandomCharFromAlphabet(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
      );
    })
    .join("");
};
