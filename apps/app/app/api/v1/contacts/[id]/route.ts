import { getAuthenticatedUser } from "features/auth/helpers/getAuthenticatedUser";
import { prisma } from "lib/prisma";
import { safeRoute } from "lib/safeRoute";
import { NextResponse } from "next/server";
import { ContactSchema } from "schemas/contact.schema";
import { z } from "zod";

export const PATCH = safeRoute
  .use(async ({ request }) => {
    return await getAuthenticatedUser(request);
  })
  .body(
    ContactSchema.omit({
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
      phone,
      avatar_url,
      bio,
      gender,
      address,
      source,
      tags,
      joined_at,
    } = body;

    const contact = await prisma.contact.update({
      where: {
        id,
      },
      data: {
        first_name,
        last_name,
        full_name,
        emails,
        phone,
        avatar_url,
        bio,
        gender,
        address,
        source,
        tags,
        joined_at: joined_at ? new Date(joined_at) : null,
        search:
          `${first_name} ${last_name} ${emails.join(" ")} ${phone}`.toLowerCase(),
        workspace_id: data.workspace_id,
      },
    });

    return NextResponse.json(ContactSchema.parse(contact));
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

    await prisma.contact.delete({
      where: {
        id,
        workspace_id: data.workspace_id,
      },
    });

    return NextResponse.json({ message: "success" });
  });
