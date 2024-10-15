import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { ContactSchema } from "@conquest/zod/contact.schema";
import { z } from "zod";

export const getContact = safeAction
  .metadata({ name: "getContact" })
  .schema(
    z.object({
      slack_id: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const contact = await prisma.contact.findUnique({
      where: {
        slack_id: parsedInput.slack_id,
      },
    });

    return ContactSchema.parse(contact);
  });
