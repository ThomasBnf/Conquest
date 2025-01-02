import {
  V1CreateMemberSchema,
  V1UpdateMemberSchema,
} from "@/app/schemas/member.schema";
import { prisma } from "@/lib/prisma";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { zValidator } from "@hono/zod-validator";
import { Prisma } from "@prisma/client";
import { Hono } from "hono";
import { z } from "zod";

export const members = new Hono()
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
        const totalMembers = await prisma.members.count({
          where: {
            workspace_id,
          },
        });

        const members = await prisma.members.findMany({
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
          total_members: totalMembers,
          members: MemberSchema.array().parse(members),
        });
      } catch (error) {
        return c.json({ error: "Failed to fetch members" }, { status: 400 });
      }
    },
  )
  .post("/", zValidator("json", V1CreateMemberSchema), async (c) => {
    const workspace_id = c.get("workspace_id");
    const member = c.req.valid("json");

    try {
      const createdMember = await prisma.members.create({
        data: {
          ...member,
          source: "MANUAL",
          level: 0,
          pulse: 0,
          presence: 0,
          logs: [],
          workspace_id,
        },
      });

      return c.json(MemberSchema.parse(createdMember));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return c.json(
            { error: "Member already exists with this email" },
            { status: 400 },
          );
        }
      }
      return c.json({ error: "Failed to create member" }, { status: 400 });
    }
  })
  .patch("/:id", zValidator("json", V1UpdateMemberSchema), async (c) => {
    const id = c.req.param("id");
    const workspace_id = c.get("workspace_id");
    const memberData = c.req.valid("json");

    try {
      const updatedMember = await prisma.members.update({
        where: {
          id,
          workspace_id,
        },
        data: {
          ...memberData,
        },
      });

      return c.json(MemberSchema.parse(updatedMember));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return c.json({ error: "Member not found" }, { status: 404 });
        }
      }
      return c.json({ error: "Failed to update member" }, { status: 400 });
    }
  })
  .delete(
    "/:id",
    zValidator("param", z.object({ id: z.string().cuid() })),
    async (c) => {
      const id = c.req.param("id");
      const workspace_id = c.get("workspace_id");

      try {
        await prisma.members.delete({
          where: {
            id,
            workspace_id,
          },
        });

        return c.json(
          { success: true, message: "Member deleted successfully" },
          { status: 200 },
        );
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            return c.json({ error: "Member not found" }, { status: 404 });
          }
        }
        return c.json({ error: "Failed to delete member" }, { status: 400 });
      }
    },
  );
