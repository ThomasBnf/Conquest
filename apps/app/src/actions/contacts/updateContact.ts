"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { ContactSchema } from "@/schemas/contact.schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateContactSchema = z.object({
  id: z.string(),
  emails: z.array(z.string()).optional(),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  address: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

type UpdateContact = z.infer<typeof updateContactSchema>;

export const updateContact = authAction
  .metadata({ name: "updateContact" })
  .schema(updateContactSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { id, emails, phone, job_title, address, bio, tags } =
      updateContactSchema.parse(parsedInput);

    const contact = await prisma.contact.findUnique({
      where: {
        id,
        workspace_id: ctx.user.workspace_id,
      },
      select: {
        first_name: true,
        last_name: true,
        emails: true,
        phone: true,
      },
    });

    const data: UpdateContact = { id };
    if (emails) data.emails = emails;
    if (phone !== undefined) data.phone = phone;
    if (job_title !== undefined) data.job_title = job_title;
    if (address !== undefined) data.address = address;
    if (bio !== undefined) data.bio = bio;
    if (tags) data.tags = tags;

    const updatedContact = await prisma.contact.update({
      where: {
        id,
        workspace_id: ctx.user.workspace_id,
      },
      data: {
        ...data,
        search:
          `${contact?.first_name?.toLowerCase() ?? ""} ${contact?.last_name?.toLowerCase() ?? ""} ${emails?.join(" ").toLowerCase() ?? contact?.emails?.join(" ").toLowerCase() ?? ""} ${phone?.toLowerCase() ?? contact?.phone?.toLowerCase() ?? ""}`.trim(),
      },
    });

    revalidatePath(`/${ctx.user.workspace.slug}/contacts`);
    return ContactSchema.parse(updatedContact);
  });
