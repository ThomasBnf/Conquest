import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { ContactSchema } from "@/schemas/contact.schema";
import { z } from "zod";

export const getContact = authAction
  .metadata({
    name: "getContact",
  })
  .schema(
    z.object({
      id: z.string(),
    }),
  )
  .action(async ({ ctx, parsedInput: { id } }) => {
    const contact = await prisma.contact.findUnique({
      where: {
        id,
        workspace_id: ctx.user.workspace_id,
      },
    });

    return ContactSchema.parse(contact);
  });
