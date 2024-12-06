import { filteredDomain } from "@/features/members/helpers/filteredDomain";
import { prisma } from "@/lib/prisma";
import { runWorkflowTrigger } from "@/trigger/runWorkflow.trigger";
import { MemberWithActivitiesSchema } from "@conquest/zod/activity.schema";
import { type Company, CompanySchema } from "@conquest/zod/company.schema";
import { type Member, MemberSchema } from "@conquest/zod/member.schema";
import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { z } from "zod";
import { idParser } from "../helpers/idParser";

type Props = Omit<Partial<Member>, "emails" | "phones" | "deleted_at"> & {
  email: string | undefined;
  phone: string | undefined;
  isDeleted?: boolean | undefined;
};

export const upsertMember = async ({
  id,
  source,
  first_name,
  last_name,
  username,
  locale,
  email,
  phone,
  avatar_url,
  job_title,
  tags,
  joined_at,
  isDeleted,
  workspace_id,
}: Props) => {
  if (!source) throw new Error("Source is required");
  if (!workspace_id) throw new Error("Workspace ID is required");

  const formattedEmail = email?.toLowerCase().trim();
  const formattedPhone = phone?.toLowerCase().trim();
  const formattedDomain = formattedEmail?.split("@")[1];

  let company: Company | null = null;

  if (formattedDomain) {
    const { companyName, domain } = filteredDomain(formattedDomain) ?? {};

    if (companyName && domain) {
      company = CompanySchema.parse(
        await prisma.companies.upsert({
          where: {
            domain,
          },
          update: {
            name: companyName.charAt(0).toUpperCase() + companyName.slice(1),
            domain,
          },
          create: {
            name: companyName.charAt(0).toUpperCase() + companyName.slice(1),
            domain,
            source,
            workspace_id,
          },
        }),
      );
    }
  }

  const idInput = idParser({ source, id });

  const newMember = await prisma.members.upsert({
    where: {
      ...idInput,
      workspace_id,
    },
    update: {
      first_name: first_name ?? null,
      last_name: last_name ?? null,
      username: username ?? null,
      emails: formattedEmail ? [formattedEmail] : undefined,
      phones: formattedPhone ? [formattedPhone] : undefined,
      locale,
      avatar_url: avatar_url ?? null,
      job_title: job_title ?? null,
      tags,
      company_id: company?.id ?? null,
      joined_at: joined_at ?? null,
      deleted_at: isDeleted ? new Date() : null,
    },
    create: {
      ...idInput,
      first_name: first_name ?? null,
      last_name: last_name ?? null,
      username: username ?? null,
      locale,
      avatar_url: avatar_url ?? null,
      emails: formattedEmail ? [formattedEmail] : undefined,
      phones: formattedPhone ? [formattedPhone] : undefined,
      job_title: job_title ?? null,
      tags,
      company_id: company?.id ?? null,
      source,
      joined_at: joined_at ?? null,
      workspace_id,
    },
  });

  const isNewMember = newMember.created_at === newMember.updated_at;

  if (isNewMember) {
    const workflows = z.array(WorkflowSchema).parse(
      await prisma.workflows.findMany({
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
      await runWorkflowTrigger.trigger({
        workflow_id: workflow.id,
        created_member: MemberWithActivitiesSchema.parse(newMember),
      });
    }
  }

  return MemberSchema.parse(newMember);
};
