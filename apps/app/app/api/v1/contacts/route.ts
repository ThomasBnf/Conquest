import { getAuthenticatedUser } from "@/features/auth/queries/getAuthenticatedUser";
import { GENDER } from "@conquest/zod/gender.enum";
import { MemberSchema } from "@conquest/zod/member.schema";
import { SOURCE } from "@conquest/zod/source.enum";
import { prisma } from "lib/prisma";
import { safeRoute } from "lib/safeRoute";
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
      phones: z.array(z.string()).optional(),
      avatar_url: z.string().optional(),
      bio: z.string().optional(),
      job_title: z.string().optional(),
      gender: GENDER.optional(),
      address: z.string().optional(),
      source: SOURCE,
      tags: z.array(z.string()).default([]),
    }),
  )
  .handler(async (_, { body, data }) => {
    const {
      first_name,
      last_name,
      emails,
      phones,
      avatar_url,
      bio,
      gender,
      address,
      source,
      tags,
    } = body;

    const member = await prisma.member.create({
      data: {
        first_name,
        last_name,
        full_name: `${first_name} ${last_name}`,
        emails,
        phones,
        avatar_url,
        bio,
        gender,
        address,
        source,
        tags,
        search:
          `${first_name} ${last_name} ${emails.join(" ")} ${phones?.join(" ")}`
            .trim()
            .toLowerCase(),
        workspace_id: data.workspace_id,
      },
    });

    return NextResponse.json(MemberSchema.parse(member));
  });
