"use server";

import { prisma } from "@/lib/prisma";
import {
  type ContactWithActivities,
  ContactWithActivitiesSchema,
} from "@conquest/zod/activity.schema";
import type { Prisma } from "@prisma/client";
import { authAction } from "lib/authAction";
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
  .action(
    async ({ ctx, parsedInput: { page, search, id, desc, from, to } }) => {
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

      const contacts = await prisma.contact.findMany({
        where,
        include,
        orderBy:
          id && !["last_activity", "joined_at"].includes(id)
            ? getOrderBy(id, desc)
            : undefined,
        take: 25,
        skip: (page - 1) * 25,
      });

      const parsedContacts =
        ContactWithActivitiesSchema.array().parse(contacts);

      if (id === "last_activity") {
        return parsedContacts.sort((a, b) =>
          desc ? sortByLastActivity(a, b) : -sortByLastActivity(a, b),
        );
      }

      if (id === "joined_at") {
        return parsedContacts.sort((a, b) =>
          desc ? sortByJoinedAt(a, b) : -sortByJoinedAt(a, b),
        );
      }

      return parsedContacts;
    },
  );

const sortByLastActivity = (
  a: ContactWithActivities,
  b: ContactWithActivities,
) => {
  const lastActivityA = a.activities[0]?.created_at?.getTime() ?? 0;
  const lastActivityB = b.activities[0]?.created_at?.getTime() ?? 0;
  return lastActivityB - lastActivityA;
};

const sortByJoinedAt = (a: ContactWithActivities, b: ContactWithActivities) => {
  const joinedAtA = a.joined_at?.getTime() ?? 0;
  const joinedAtB = b.joined_at?.getTime() ?? 0;
  return joinedAtB - joinedAtA;
};

const getOrderBy = (
  id: string | undefined,
  desc: boolean | undefined,
): Prisma.ContactOrderByWithRelationInput => {
  if (id === "activities") {
    return { activities: { _count: desc ? "desc" : "asc" } };
  }
  return { [id as string]: desc ? "desc" : "asc" };
};
