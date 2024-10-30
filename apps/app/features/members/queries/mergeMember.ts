import { authAction } from "@/lib/authAction";
import { prisma } from "@/lib/prisma";
import { MemberSchema } from "@conquest/zod/member.schema";
import { z } from "zod";

export const mergeMember = authAction
  .metadata({
    name: "mergeMember",
  })
  .schema(
    z.object({
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      full_name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      avatar_url: z.string().optional(),
      job_title: z.string().optional(),
      slack_id: z.string().optional(),
    }),
  )
  .action(
    async ({
      ctx,
      parsedInput: {
        first_name,
        last_name,
        full_name,
        email,
        phone,
        avatar_url,
        job_title,
        slack_id,
      },
    }) => {
      const workspace_id = ctx.user.workspace_id;

      const existingMember = await prisma.member.findFirst({
        where: {
          emails: { has: email },
          workspace_id,
        },
      });

      if (existingMember) {
        const updatedEmails = new Set(existingMember.emails);
        if (email) updatedEmails.add(email);

        const updatedPhones = new Set(existingMember.phones);
        if (phone) updatedPhones.add(phone);

        const member = await prisma.member.update({
          where: {
            id: existingMember.id,
            workspace_id,
          },
          data: {
            first_name: existingMember.first_name ?? first_name,
            last_name: existingMember.last_name ?? last_name,
            full_name: existingMember.full_name ?? full_name,
            emails: Array.from(updatedEmails).filter(Boolean),
            phones: Array.from(updatedPhones).filter(Boolean),
            avatar_url: existingMember.avatar_url ?? avatar_url,
            job_title: existingMember.job_title ?? job_title,
            search:
              `${full_name ?? existingMember.full_name} ${Array.from(updatedEmails).join(" ")}  ${Array.from(updatedPhones).join(" ")}`
                .trim()
                .toLowerCase(),
            slack_id: existingMember.slack_id,
          },
        });

        return MemberSchema.parse(member);
      }

      const member = await prisma.member.create({
        data: {
          first_name: first_name ?? null,
          last_name: last_name ?? null,
          full_name: full_name ?? null,
          emails: email ? [email] : [],
          phones: phone ? [phone] : [],
          avatar_url: avatar_url ?? null,
          job_title: job_title ?? null,
          source: "SLACK",
          search: `${full_name} ${email ?? ""} ${phone ?? ""}`
            .trim()
            .toLowerCase(),
          slack_id: slack_id ?? null,
          workspace_id,
        },
      });

      return MemberSchema.parse(member);
    },
  );
