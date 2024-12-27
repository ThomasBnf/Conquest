"use server";

import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { MemberSchema } from "@conquest/zod/member.schema";
import { SOURCE } from "@conquest/zod/schemas/enum/source.enum";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateMember = safeAction
  .metadata({
    name: "updateMember",
  })
  .schema(
    z.object({
      id: z.string(),
      company_id: z.string().optional(),
      primary_email: z.string().optional(),
      secondary_emails: z.array(z.string()).optional(),
      phones: z.array(z.string()).optional(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      job_title: z.string().optional(),
      location: z.string().optional(),
      bio: z.string().optional(),
      source: SOURCE.optional(),
      tags: z.array(z.string()).optional(),
    }),
  )
  .action(
    async ({
      parsedInput: {
        id,
        company_id,
        primary_email,
        secondary_emails,
        phones,
        first_name,
        last_name,
        job_title,
        location,
        bio,
        source,
        tags,
      },
    }) => {
      const member = await prisma.members.update({
        where: {
          id,
        },
        data: {
          company_id,
          primary_email,
          secondary_emails,
          phones,
          first_name,
          last_name,
          job_title,
          location,
          bio,
          source,
          tags,
        },
      });

      revalidatePath(`/members/${member.id}`);
      return MemberSchema.parse(member);
    },
  );
