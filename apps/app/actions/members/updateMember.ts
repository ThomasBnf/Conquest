"use server";

import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { SOURCE } from "@conquest/zod/enum/source.enum";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateMember = safeAction
  .metadata({
    name: "updateMember",
  })
  .schema(
    z.object({
      id: z.string(),
      company_id: z.string().optional().nullable(),
      primary_email: z.string().optional().nullable(),
      secondary_emails: z.array(z.string()).optional(),
      phones: z.array(z.string()).optional(),
      first_name: z.string().optional().nullable(),
      last_name: z.string().optional().nullable(),
      linkedin_url: z.string().optional().nullable(),
      job_title: z.string().optional().nullable(),
      locale: z.string().optional().nullable(),
      source: SOURCE.optional(),
      tags: z.array(z.string()).optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const {
      id,
      company_id,
      primary_email,
      secondary_emails,
      phones,
      first_name,
      last_name,
      linkedin_url,
      job_title,
      locale,
      source,
      tags,
    } = parsedInput;

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
        linkedin_url,
        job_title,
        locale,
        source,
        tags,
      },
    });

    revalidatePath(`/members/${member.id}`);
    return MemberSchema.parse(member);
  });
