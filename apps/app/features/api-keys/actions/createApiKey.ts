"use server";

import { APIKeySchema } from "@conquest/zod/apikey.schema";
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
    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        token: await generateId(24),
        user_id: ctx.user.id,
      },
    });

    revalidatePath(`/w/${slug}/settings/api`);
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
