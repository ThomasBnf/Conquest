import { prisma } from "@conquest/db/prisma";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const inviteUsers = protectedProcedure
  .input(
    z.object({
      emails: z.string().min(1, { message: "Emails are required" }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { emails } = input;
    const { user } = ctx;
    const { workspaceId } = user;

    const parsedEmails = emails.split(",").map((email) => email.trim());
    console.log(parsedEmails);

    const users = await prisma.userInWorkspace.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: true,
      },
    });

    console.log(users);
  });
