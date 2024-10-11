"use server";

import { authAction } from "@/lib/authAction";
import { prisma as db } from "@/lib/prisma";
import { ContactWithActivitiesSchema } from "@/schemas/activity.schema";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const listContacts = authAction
  .metadata({ name: "listContacts" })
  .schema(
    z.object({
      page: z.number(),
      search: z.string().optional(),
      id: z.string().optional(),
      desc: z.boolean().optional(),
      from: z.date().optional(),
      to: z.date().optional(),
    }),
  )
  .action(async ({ ctx, parsedInput: { page, search, id, desc, from, to } }) => {
    const where: Prisma.ContactWhereInput = {
      workspace_id: ctx.user.workspace_id,
      search: search ? { contains: search, mode: "insensitive" } : undefined,
    };

    const include: Prisma.ContactInclude = {
      activities: {
        orderBy: { created_at: "desc" },
        where: {
          created_at: {
            gte: from ?? undefined,
            lte: to ?? undefined,
          },
        },
      },
    };

    if (id === "last_activity") {
      const contacts = await db.contact.findMany({
        where,
        include,
        take: 20,
        skip: (page - 1) * 20,
      });

      const parsedContacts = ContactWithActivitiesSchema.array().parse(contacts);

      return parsedContacts.sort((a, b) => {
        const lastActivityA = a.activities[0]?.created_at?.getTime() ?? 0;
        const lastActivityB = b.activities[0]?.created_at?.getTime() ?? 0;

        return desc ? lastActivityB - lastActivityA : lastActivityA - lastActivityB;
      });
    }

    if (id === "joined_at") {
      const contacts = await db.contact.findMany({
        where,
        include,
        take: 20,
        skip: (page - 1) * 20,
      });

      const parsedContacts = ContactWithActivitiesSchema.array().parse(contacts);

      return parsedContacts.sort((a, b) => {
        const joinedAtA = a.joined_at;
        const joinedAtB = b.joined_at;

        if (!joinedAtA || !joinedAtB) return 0;

        if (desc === true) {
          return joinedAtB.getTime() - joinedAtA.getTime() ?? 0;
        }
        return joinedAtA.getTime() - joinedAtB.getTime() ?? 0;
      });
    }

    const orderBy = (() => {
      if (id === "activities") {
        return { activities: { _count: desc ? "desc" : "asc" } };
      }
      return { [id as string]: desc ? "desc" : "asc" };
    })() as Prisma.ContactOrderByWithAggregationInput;

    const contacts = await db.contact.findMany({
      where,
      include,
      orderBy,
      take: 20,
      skip: (page - 1) * 20,
    });

    const parsedContacts = ContactWithActivitiesSchema.array().parse(contacts);

    return parsedContacts;
  });
