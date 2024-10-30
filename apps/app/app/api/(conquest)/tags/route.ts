import { getCurrentUser } from "@/helpers/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { safeRoute } from "@/lib/safeRoute";
import { NextResponse } from "next/server";

export const GET = safeRoute
  .use(async () => {
    return await getCurrentUser();
  })
  .handler(async (_, { data: user }) => {
    const workspace_id = user.workspace_id;

    const tags = await prisma.tag.findMany({
      where: {
        workspace_id,
      },
      orderBy: {
        name: "desc",
      },
    });

    return NextResponse.json(tags);
  });
