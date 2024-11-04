import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { MemberSchema } from "@conquest/zod/member.schema";
import { z } from "zod";

export const mergeMember = safeAction
  .metadata({
    name: "mergeMember",
  })
  .schema(
    z.object({
      slack_id: z.string().optional(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      full_name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      avatar_url: z.string().optional(),
      job_title: z.string().optional(),
      workspace_id: z.string().cuid(),
    }),
  )
  .action(
    async ({
      parsedInput: {
        slack_id,
        first_name,
        last_name,
        full_name,
        email,
        phone,
        avatar_url,
        job_title,
        workspace_id,
      },
    }) => {
      const formattedEmail = email?.toLowerCase().trim();
      const formattedPhone = phone?.toLowerCase().trim();

      const member = await prisma.member.upsert({
        where: {
          slack_id,
        },
        update: {
          first_name: first_name ?? null,
          last_name: last_name ?? null,
          full_name: full_name ?? null,
          emails: formattedEmail ? [formattedEmail] : undefined,
          phones: formattedPhone ? [formattedPhone] : undefined,
          avatar_url: avatar_url ?? null,
          job_title: job_title ?? null,
          search: search(
            { full_name },
            formattedEmail ? [formattedEmail] : undefined,
            formattedPhone ? [formattedPhone] : undefined,
          ),
        },
        create: {
          slack_id,
          first_name: first_name ?? null,
          last_name: last_name ?? null,
          full_name: full_name ?? null,
          emails: formattedEmail ? [formattedEmail] : undefined,
          phones: formattedPhone ? [formattedPhone] : undefined,
          avatar_url: avatar_url ?? null,
          job_title: job_title ?? null,
          source: "SLACK",
          search: search(
            { full_name },
            formattedEmail ? [formattedEmail] : undefined,
            formattedPhone ? [formattedPhone] : undefined,
          ),
          workspace_id,
        },
      });

      return MemberSchema.parse(member);
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
