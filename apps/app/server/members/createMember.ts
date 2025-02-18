import { MemberFormSchema } from "@/features/members/schema/member-form.schema";
import { prisma } from "@conquest/db/prisma";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { protectedProcedure } from "../trpc";

export const createMember = protectedProcedure
  .input(MemberFormSchema)
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { email, ...data } = input;

    const member = await prisma.member.create({
      data: {
        ...data,
        primary_email: email,
        source: "MANUAL",
        workspace_id,
      },
    });

    return MemberSchema.parse(member);
  });
