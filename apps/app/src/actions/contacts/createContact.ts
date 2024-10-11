"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { ContactSchema } from "@/schemas/contact.schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createContact = authAction
  .metadata({ name: "createContact" })
  .schema(
    z.object({
      first_name: z.string(),
      last_name: z.string(),
      email: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { first_name, last_name, email } }) => {
    const contact = await prisma.contact.create({
      data: {
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
        emails: [email],
        source: "MANUAL",
        search: `${first_name} ${last_name} ${email}`.trim().toLowerCase(),
        joined_at: new Date(),
        workspace_id: ctx.user.workspace_id,
      },
    });

    revalidatePath(`/${ctx.user.workspace.slug}/contacts`);
    return ContactSchema.parse(contact);
  });
