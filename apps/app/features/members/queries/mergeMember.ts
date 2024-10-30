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
      const formattedEmail = email?.toLowerCase().trim();
      const formattedPhone = phone?.toLowerCase().trim();

      const member = await prisma.member.findFirst({
        where: {
          emails: { has: formattedEmail },
          workspace_id,
        },
      });

      const updatedEmails = new Set(member?.emails);
      if (formattedEmail) updatedEmails.add(formattedEmail);

      const updatedPhones = new Set(member?.phones);
      if (formattedPhone) updatedPhones.add(formattedPhone);

      const emails = Array.from(updatedEmails).filter(Boolean);
      const phones = Array.from(updatedPhones).filter(Boolean);

      const newMember = await prisma.member.upsert({
        where: {
          slack_id,
        },
        update: {
          first_name: member?.first_name ?? first_name,
          last_name: member?.last_name ?? last_name,
          full_name: member?.full_name ?? full_name,
          emails: emails,
          phones: phones,
          avatar_url: member?.avatar_url ?? avatar_url,
          job_title: member?.job_title ?? job_title,
          search: search(
            { full_name: full_name ?? member?.full_name },
            emails,
            phones,
          ),
          slack_id: member?.slack_id,
        },
        create: {
          first_name: first_name ?? null,
          last_name: last_name ?? null,
          full_name: full_name ?? null,
          emails: emails,
          phones: phones,
          avatar_url: avatar_url ?? null,
          job_title: job_title ?? null,
          source: "SLACK",
          search: search({ full_name: full_name }, emails, phones),
          slack_id: slack_id ?? null,
          workspace_id,
        },
      });

      return MemberSchema.parse(newMember);
    },
  );

const search = (
  { full_name }: { full_name: string | null | undefined },
  emails: string[] = [],
  phones: string[] = [],
) => {
  const searchTerms = [full_name, ...emails, ...phones].filter(Boolean);

  return searchTerms.join(" ").trim().toLowerCase();
};
