import { getAuthenticatedUser } from "@/features/auth/functions/getAuthenticatedUser";
import { MemberSchema } from "@conquest/zod/member.schema";
import { prisma } from "lib/prisma";
import { safeRoute } from "lib/safeRoute";
import { NextResponse } from "next/server";
import { z } from "zod";

export const PATCH = safeRoute
  .use(async ({ request }) => {
    return await getAuthenticatedUser(request);
  })
  .body(
    MemberSchema.omit({
      search: true,
      workspace_id: true,
      created_at: true,
      updated_at: true,
    }),
  )
  .handler(async (_, { body, data }) => {
    const {
      id,
      first_name,
      last_name,
      full_name,
      emails,
      phones,
      avatar_url,
      bio,
      gender,
      source,
      tags,
    } = body;

    const member = await prisma.member.update({
      where: {
        id,
      },
      data: {
        first_name,
        last_name,
        full_name,
        emails,
        phones,
        avatar_url,
        bio,
        gender,
        source,
        tags,
        search:
          `${first_name} ${last_name} ${emails.join(" ")} ${phones?.join(" ")}`.toLowerCase(),
        workspace_id: data.workspace_id,
      },
    });

    return NextResponse.json(MemberSchema.parse(member));
  });

export const DELETE = safeRoute
  .use(async ({ request }) => {
    return await getAuthenticatedUser(request);
  })
  .params(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .handler(async (_, { params, data }) => {
    const { id } = params;

    await prisma.member.delete({
      where: {
        id,
        workspace_id: data.workspace_id,
      },
    });

    return NextResponse.json({ message: "success" });
  });
