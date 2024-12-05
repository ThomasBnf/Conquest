import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/queries/users/getAuthUser";
import { FileWithTypeSchema } from "@conquest/zod/schemas/file.schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

export const files = new Hono()
  .use(async (c, next) => {
    const user = await getAuthUser(c);
    if (!user) throw new Error("Unauthorized");

    c.set("user", user);
    await next();
  })
  .get(
    "/:activityId",
    zValidator("param", z.object({ token: z.string().optional() })),
    async (c) => {
      const { activityId } = c.req.param();
      const token = c.req.param("token");

      const files = await prisma.files.findMany({
        where: {
          activity_id: activityId,
        },
      });

      const filesWithUrl = await Promise.all(
        files.map(async (file) => {
          const response = await fetch(file.url, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            return { error: "Failed to fetch file" };
          }

          const contentType =
            response.headers.get("content-type") ?? "image/jpeg";
          const blob = await response.blob();
          const base64 = Buffer.from(await blob.arrayBuffer()).toString(
            "base64",
          );
          const dataUrl = `data:${file.url.includes(".pdf") ? "application/pdf" : contentType};base64,${base64}`;

          return {
            ...file,
            url: dataUrl,
            type: file.url.includes(".pdf") ? "pdf" : "image",
          };
        }),
      );

      return c.json(FileWithTypeSchema.array().parse(filesWithUrl));
    },
  );
