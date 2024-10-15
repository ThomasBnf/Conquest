import { ContactWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const listContacts = authAction
  .metadata({ name: "listContacts" })
  .schema(
    z.object({
      from: z.date().optional(),
      to: z.date().optional(),
      page: z.number().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput: { from, to, page } }) => {
    const contacts = await prisma.contact.findMany({
      where: {
        workspace_id: ctx.user.workspace_id,
      },
      include: {
        activities: {
          orderBy: {
            created_at: "asc",
          },
        },
      },
      orderBy: {
        activities: {
          _count: "desc",
        },
      },
    });

    const parsedContacts = ContactWithActivitiesSchema.array().parse(contacts);

    if (from && to) {
      return parsedContacts.filter((contact) => {
        return contact.activities.some((activity) => {
          return activity.created_at >= from && activity.created_at <= to;
        });
      });
    }

    return parsedContacts;
  });
