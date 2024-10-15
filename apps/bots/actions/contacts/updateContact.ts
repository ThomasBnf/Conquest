import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { ContactSchema } from "@conquest/zod/contact.schema";
import { z } from "zod";

export const updateContact = safeAction
  .metadata({
    name: "updateContact",
  })
  .schema(
    z.object({
      slack_id: z.string(),
      first_name: z.string(),
      last_name: z.string(),
      phone: z.string(),
      avatar_url: z.string().optional(),
      job_title: z.string(),
    }),
  )
  .action(
    async ({
      parsedInput: {
        slack_id,
        first_name,
        last_name,
        phone: newPhone,
        avatar_url,
        job_title,
      },
    }) => {
      const currentContact = await prisma.contact.findUnique({
        where: {
          slack_id,
        },
      });

      const { emails, phone } = ContactSchema.parse(currentContact);
      const newSearch = `${first_name} ${last_name} ${emails} ${newPhone ?? phone}`;

      const contact = await prisma.contact.update({
        where: {
          slack_id,
        },
        data: {
          first_name,
          last_name,
          full_name: `${first_name} ${last_name}`,
          phone: newPhone ?? phone,
          avatar_url,
          job_title,
          search: newSearch,
        },
      });

      return ContactSchema.parse(contact);
    },
  );
