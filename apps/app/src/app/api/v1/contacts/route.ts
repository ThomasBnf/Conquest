import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { safeRoute } from "@/lib/safeRoute";
import { ContactSchema, GENDER, SOURCE } from "@/schemas/contact.schema";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export const POST = safeRoute
  .use(async ({ request }) => {
    return await getAuthenticatedUser(request);
  })
  .body(
    z.object({
      first_name: z.string(),
      last_name: z.string(),
      emails: z.array(z.string()).min(1),
      phone: z.string().optional(),
      avatar_url: z.string().optional(),
      bio: z.string().optional(),
      job_title: z.string().optional(),
      gender: GENDER.optional(),
      address: z.string().optional(),
      source: SOURCE,
      tags: z.array(z.string()).default([]),
      joined_at: z.coerce.date(),
    }),
  )
  .handler(async (_, { body, data }) => {
    const {
      first_name,
      last_name,
      emails,
      phone,
      avatar_url,
      bio,
      gender,
      address,
      source,
      tags,
      joined_at,
    } = body;

    const contact = await prisma.contact.create({
      data: {
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
        emails,
        phone,
        avatar_url,
        bio,
        gender,
        address,
        source,
        tags,
        joined_at: new Date(joined_at),
        search: `${first_name} ${last_name} ${emails.join(" ")} ${phone ?? ""}`
          .trim()
          .toLowerCase(),
        workspace_id: data.workspace_id,
      },
    });

    return NextResponse.json(ContactSchema.parse(contact));
  });
