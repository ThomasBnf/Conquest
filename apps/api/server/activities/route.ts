import { prisma } from "@/lib/prisma";
import {
  V1CreateActivitySchema,
  V1UpdateActivitySchema,
} from "@/schemas/activity.schema";
import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";
import { zValidator } from "@hono/zod-validator";
import { Prisma } from "@prisma/client";
import { Hono } from "hono";
import { z } from "zod";

export const activities = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number().min(1).default(1),
        pageSize: z.coerce.number().min(10).max(100).default(10),
      }),
    ),
    async (c) => {
      const { page, pageSize } = c.req.valid("query");
      const workspace_id = c.get("workspace_id");

      try {
        const totalActivities = await prisma.activities.count({
          where: {
            workspace_id,
          },
        });

        const activities = await prisma.activities.findMany({
          where: {
            workspace_id,
          },
          orderBy: {
            created_at: "desc",
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        });

        return c.json({
          page,
          page_size: pageSize,
          total_activities: totalActivities,
          activities: ActivitySchema.array().parse(activities),
        });
      } catch (error) {
        return c.json({ error: "Failed to fetch activities" }, { status: 400 });
      }
    },
  )
  .post("/:memberId", zValidator("json", V1CreateActivitySchema), async (c) => {
    const workspace_id = c.get("workspace_id");
    const memberId = c.req.param("memberId");
    const activity = c.req.valid("json");

    const { activity_key, ...activityData } = activity;

    const activity_type = await prisma.activities_types.findUnique({
      where: {
        key_workspace_id: {
          key: activity_key,
          workspace_id,
        },
      },
    });

    if (!activity_type) {
      return c.json({ error: "Activity type not found" }, { status: 404 });
    }

    try {
      const newActivity = await prisma.activities.create({
        data: {
          ...activityData,
          member_id: memberId,
          activity_type_id: activity_type.id,
          workspace_id,
        },
      });

      return c.json(ActivitySchema.parse(newActivity));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return c.json({ error: "Activity already exists" }, { status: 400 });
        }
        if (error.code === "P2003") {
          return c.json({ error: "Member not found" }, { status: 404 });
        }
      }
      return c.json({ error: "Failed to create activity" }, { status: 400 });
    }
  })
  .patch("/:id", zValidator("json", V1UpdateActivitySchema), async (c) => {
    const id = c.req.param("id");
    const workspace_id = c.get("workspace_id");
    const activity = c.req.valid("json");

    const { activity_key, ...activityData } = activity;

    if (activity_key) {
      const activity_type = await prisma.activities_types.findUnique({
        where: {
          key_workspace_id: {
            key: activity_key,
            workspace_id,
          },
        },
      });

      if (!activity_type) {
        return c.json({ error: "Activity type not found" }, { status: 404 });
      }
    }

    try {
      const updatedActivity = await prisma.activities.update({
        where: {
          id,
          workspace_id,
        },
        data: {
          ...activityData,
        },
      });

      return c.json(ActivitySchema.parse(updatedActivity));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return c.json({ error: "Activity not found" }, { status: 404 });
        }
      }
      return c.json({ error: "Failed to update activity" }, { status: 400 });
    }
  })
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string().cuid() })),
    async (c) => {
      const id = c.req.param("id");
      const workspace_id = c.get("workspace_id");

      try {
        await prisma.activities.delete({
          where: {
            id,
            workspace_id,
          },
        });

        return c.json(
          { success: true, message: "Activity deleted successfully" },
          { status: 200 },
        );
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            return c.json({ error: "Activity not found" }, { status: 404 });
          }
        }
        return c.json({ error: "Failed to delete activity" }, { status: 400 });
      }
    },
  );
