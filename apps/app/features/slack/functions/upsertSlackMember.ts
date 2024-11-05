import { _runWorkflowInngest } from "@/features/workflows/actions/_runWorkflowInngest";
import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { type Company, CompanySchema } from "@conquest/zod/company.schema";
import { MemberSchema } from "@conquest/zod/member.schema";
import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { WebClient } from "@slack/web-api";
import { z } from "zod";
import { filteredDomain } from "../helpers/filteredDomain";

export const upsertSlackMember = safeAction
  .metadata({
    name: "upsertSlackMember",
  })
  .schema(
    z.object({
      user: z.string(),
      workspace_id: z.string(),
      token: z.string(),
      deleted: z.boolean().optional(),
    }),
  )
  .action(async ({ parsedInput: { user, workspace_id, token, deleted } }) => {
    const web = new WebClient(token);

    const { profile } = await web.users.profile.get({ user });

    if (!profile) return;

    const {
      first_name,
      last_name,
      real_name: full_name,
      email,
      phone,
      image_1024: avatar_url,
      title: job_title,
    } = profile;

    const formattedEmail = email?.toLowerCase().trim();
    const formattedPhone = phone?.toLowerCase().trim();
    const formattedDomain = formattedEmail?.split("@")[1];

    let company: Company | null = null;

    if (formattedDomain) {
      const { companyName, domain } = filteredDomain(formattedDomain) ?? {};
      if (!companyName || !domain) return;

      company = CompanySchema.parse(
        await prisma.company.upsert({
          where: {
            domain,
          },
          update: {
            name: companyName,
            domain,
          },
          create: {
            name: companyName,
            domain,
            workspace_id,
          },
        }),
      );
    }

    const member = await prisma.member.upsert({
      where: {
        slack_id: user,
      },
      update: {
        first_name: first_name ?? null,
        last_name: last_name ?? null,
        full_name: full_name ?? null,
        emails: formattedEmail ? [formattedEmail] : undefined,
        phones: formattedPhone ? [formattedPhone] : undefined,
        avatar_url: avatar_url ?? null,
        job_title: job_title ?? null,
        company_id: company?.id ?? null,
        search: search(
          { full_name },
          formattedEmail ? [formattedEmail] : undefined,
          formattedPhone ? [formattedPhone] : undefined,
        ),
        deleted_at: deleted ? new Date() : null,
      },
      create: {
        slack_id: user ?? null,
        first_name: first_name ?? null,
        last_name: last_name ?? null,
        full_name: full_name ?? null,
        avatar_url: avatar_url ?? null,
        emails: formattedEmail ? [formattedEmail] : undefined,
        phones: formattedPhone ? [formattedPhone] : undefined,
        job_title: job_title ?? null,
        company_id: company?.id ?? null,
        source: "SLACK",
        search: search(
          { full_name },
          formattedEmail ? [formattedEmail] : undefined,
          formattedPhone ? [formattedPhone] : undefined,
        ),
        workspace_id,
      },
    });

    const isNewMember = member.created_at === member.updated_at;

    if (isNewMember) {
      const workflows = z.array(WorkflowSchema).parse(
        await prisma.workflow.findMany({
          where: {
            published: true,
            workspace_id,
          },
        }),
      );

      const filteredWorkflows = workflows.filter((workflow) =>
        workflow.nodes.some((node) => node.data.type === "member-created"),
      );

      for (const workflow of filteredWorkflows) {
        await _runWorkflowInngest({ workflow_id: workflow.id });
      }
    }

    return MemberSchema.parse(member);
  });

const search = (
  { full_name }: { full_name: string | null | undefined },
  emails: string[] = [],
  phones: string[] = [],
) => {
  const searchTerms = [full_name, ...emails, ...phones].filter(Boolean);

  return searchTerms.join(" ").trim().toLowerCase();
};
