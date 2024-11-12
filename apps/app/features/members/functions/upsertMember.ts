import { filteredDomain } from "@/features/members/helpers/filteredDomain";
import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { runWorkflow } from "@/trigger/runWorkflow.trigger";
import { type Company, CompanySchema } from "@conquest/zod/company.schema";
import { MemberSchema } from "@conquest/zod/member.schema";
import { SOURCE } from "@conquest/zod/source.enum";
import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { z } from "zod";

export const upsertMember = safeAction
  .metadata({
    name: "upsertMember",
  })
  .schema(
    z.object({
      id: z.string(),
      source: SOURCE,
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      full_name: z.string().optional(),
      username: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      job_title: z.string().nullable().optional(),
      avatar_url: z.string().optional(),
      tags: z.array(z.string()).optional(),
      joined_at: z.coerce.date().optional(),
      deleted: z.boolean().optional(),
      workspace_id: z.string(),
    }),
  )
  .action(
    async ({
      parsedInput: {
        id,
        source,
        first_name,
        last_name,
        full_name,
        username,
        email,
        phone,
        avatar_url,
        job_title,
        tags,
        joined_at,
        deleted,
        workspace_id,
      },
    }) => {
      const formattedEmail = email?.toLowerCase().trim();
      const formattedPhone = phone?.toLowerCase().trim();
      const formattedDomain = formattedEmail?.split("@")[1];

      let company: Company | null = null;

      if (formattedDomain) {
        const { companyName, domain } = filteredDomain(formattedDomain) ?? {};

        if (companyName && domain) {
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
                source,
                workspace_id,
              },
            }),
          );
        }
      }

      const whereParser = () => {
        switch (source) {
          case "SLACK":
            return { slack_id: id, workspace_id };
          case "DISCOURSE":
            return { discourse_id: id, workspace_id };
          default:
            return { id, workspace_id };
        }
      };
      const where = whereParser();

      const idParser = () => {
        switch (source) {
          case "SLACK":
            return { slack_id: id };
          case "DISCOURSE":
            return { discourse_id: id };
          default:
            return { id };
        }
      };
      const idInput = idParser();

      const member = await prisma.member.upsert({
        where,
        update: {
          first_name: first_name ?? null,
          last_name: last_name ?? null,
          full_name: full_name ?? null,
          username: username ?? null,
          emails: formattedEmail ? [formattedEmail] : undefined,
          phones: formattedPhone ? [formattedPhone] : undefined,
          avatar_url: avatar_url ?? null,
          job_title: job_title ?? null,
          tags,
          company_id: company?.id ?? null,
          search: search(
            { full_name },
            formattedEmail ? [formattedEmail] : undefined,
            formattedPhone ? [formattedPhone] : undefined,
          ),
          joined_at: joined_at ?? null,
          deleted_at: deleted ? new Date() : null,
        },
        create: {
          ...idInput,
          first_name: first_name ?? null,
          last_name: last_name ?? null,
          full_name: full_name ?? null,
          username: username ?? null,
          avatar_url: avatar_url ?? null,
          emails: formattedEmail ? [formattedEmail] : undefined,
          phones: formattedPhone ? [formattedPhone] : undefined,
          job_title: job_title ?? null,
          tags,
          company_id: company?.id ?? null,
          source: "SLACK",
          search: search(
            { full_name },
            formattedEmail ? [formattedEmail] : undefined,
            formattedPhone ? [formattedPhone] : undefined,
          ),
          joined_at: joined_at ?? null,
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
          await runWorkflow.trigger({ workflow_id: workflow.id });
        }
      }

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
