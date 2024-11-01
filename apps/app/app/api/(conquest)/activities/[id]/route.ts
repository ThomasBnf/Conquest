import { getActivity } from "@/features/activities/functions/getActivity";
import { getCurrentUser } from "@/features/users/functions/getCurrentUser";
import { safeRoute } from "@/lib/safeRoute";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = safeRoute
  .use(async () => {
    return await getCurrentUser();
  })
  .params(
    z.object({
      id: z.string(),
    }),
  )
  .handler(async (_, { params, data: user }) => {
    const { id } = params;
    const workspace_id = user.workspace_id;

    const rActivity = await getActivity({
      external_id: id,
      workspace_id,
    });

    return NextResponse.json(rActivity?.data);
  });
