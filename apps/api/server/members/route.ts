import { badRequest, notFound } from "@/lib/utils";
import {
  V1CreateMemberSchema,
  V1UpdateMemberSchema,
} from "@/schemas/member.schema";
import { prisma } from "@conquest/db/prisma";
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
        page_size: z.coerce.number().min(10).max(100).default(10),
      }),
    ),
    async (c) => {
      const { page, page_size } = c.req.valid("query");
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
          skip: (page - 1) * page_size,
          take: page_size,
        });

        return c.json({
          page,
          page_size,
          total_members: totalMembers,
          members: MemberSchema.array().parse(members),
        });
      } catch (error) {
        return badRequest(c, "Failed to fetch members");
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

      return c.json({ member: MemberSchema.parse(createdMember) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return badRequest(c, "Member already exists with this email");
        }
      }
      return badRequest(c, "Failed to create member");
    }
  })
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().cuid() })),
    async (c) => {
      const id = c.req.param("id");
      const workspace_id = c.get("workspace_id");

      try {
        const member = await prisma.members.findUnique({
          where: {
            id,
            workspace_id,
          },
        });

        return c.json({ member: MemberSchema.parse(member) });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            return notFound(c, "Member not found");
          }
        }
        return badRequest(c, "Failed to fetch member");
      }
    },
  )
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

      return c.json({ member: MemberSchema.parse(updatedMember) });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return notFound(c, "Member not found");
        }
      }
      return badRequest(c, "Failed to update member");
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

        return c.json({ message: "Member deleted successfully" });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2025") {
            return notFound(c, "Member not found");
          }
        }
        return badRequest(c, "Failed to delete member");
      }
    },
  );
