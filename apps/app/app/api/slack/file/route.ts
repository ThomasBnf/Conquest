import { getCurrentUser } from "@/features/users/functions/getCurrentUser";
import { safeRoute } from "@/lib/safeRoute";
import { NextResponse } from "next/server";
import { z } from "zod";

export const GET = safeRoute
  .use(async () => {
    return await getCurrentUser();
  })
  .query(
    z.object({
      url: z.string().url(),
      token: z.string().min(1),
    }),
  )
  .handler(async (_, { query: { url, token } }) => {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch file from Slack" },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    const blob = await response.blob();
    const base64 = Buffer.from(await blob.arrayBuffer()).toString("base64");

    if (url.includes(".pdf")) {
      return NextResponse.json({
        url: `data:application/pdf;base64,${base64}`,
        type: "pdf",
      });
    }

    return NextResponse.json({
      url: `data:${contentType};base64,${base64}`,
      type: "image",
    });
  });
