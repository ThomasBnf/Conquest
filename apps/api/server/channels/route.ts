import { prisma } from "@/lib/prisma";
import { badRequest, notFound } from "@/lib/utils";
import {
  V1CreateChannelSchema,
  V1UpdateChannelSchema,
} from "@/schemas/channel.schema";
import { ChannelSchema } from "@conquest/zod/schemas/channel.schema";
import { zValidator } from "@hono/zod-validator";
import { Prisma } from "@prisma/client";
import { Hono } from "hono";
import { z } from "zod";

export const channels = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number().min(1).default(1),
        page_size: z.coerce.number().min(10).max(100).default(10),
      }),
    ),
    async (c) => {
      const { page, page_size } = c.req.valid("query");
      const workspace_id = c.get("workspace_id");

      try {
        const totalChannels = await prisma.channels.count({
          where: {
            workspace_id,
          },
        });

        const channels = await prisma.channels.findMany({
          where: {
            workspace_id,
          },
          orderBy: {
            created_at: "desc",
          },
          skip: (page - 1) * page_size,
          take: page_size,
        });

        return c.json({
          page,
          page_size: page_size,
          total_channels: totalChannels,
          channels: ChannelSchema.array().parse(channels),
        });
      } catch (error) {
        return badRequest(c, "Failed to fetch channels");
      }
    },
  )
  .post("/", zValidator("json", V1CreateChannelSchema), async (c) => {
    const workspace_id = c.get("workspace_id");
    const channel = c.req.valid("json");

    try {
      const createdChannel = await prisma.channels.create({
        data: {
          ...channel,
          workspace_id,
        },
      });

      return c.json(ChannelSchema.parse(createdChannel));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return badRequest(c, "Channel already exists");
        }
      }
      return badRequest(c, "Failed to create channel");
    }
  })
  .patch("/:id", zValidator("json", V1UpdateChannelSchema), async (c) => {
    const id = c.req.param("id");
    const workspace_id = c.get("workspace_id");
    const channelData = c.req.valid("json");

    try {
      const updatedChannel = await prisma.channels.update({
        where: {
          id,
          workspace_id,
        },
        data: {
          ...channelData,
        },
      });

      return c.json(ChannelSchema.parse(updatedChannel));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return notFound(c, "Channel not found");
        }
      }
      return badRequest(c, "Failed to update channel");
    }
  })
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string().cuid() })),
    async (c) => {
      const id = c.req.param("id");
      const workspace_id = c.get("workspace_id");

      try {
        await prisma.channels.delete({
          where: {
            id,
            workspace_id,
          },
        });

        return c.json({ message: "Channel deleted successfully" });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            return notFound(c, "Channel not found");
          }
        }
        return badRequest(c, "Failed to delete channel");
      }
    },
  );
