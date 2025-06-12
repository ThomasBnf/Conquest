import { protectedProcedure } from "@/server/trpc";
import { listAllCompanies } from "@conquest/clickhouse/company/listAllCompanies";
import { updateManyCompanies } from "@conquest/clickhouse/company/updateManyCompanies";
import { listAllMembers } from "@conquest/clickhouse/member/listAllMembers";
import { updateManyMembers } from "@conquest/clickhouse/member/updateManyMembers";
import { deleteField as _deleteField } from "@conquest/db/custom-fields/deleteField";
import z from "zod";

export const deleteField = protectedProcedure
  .input(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { id } = input;

    await _deleteField(input);

    await updateMembers({ id, workspaceId });
    await updateCompanies({ id, workspaceId });
  });

type Props = {
  id: string;
  workspaceId: string;
};

const updateMembers = async ({ id, workspaceId }: Props) => {
  const members = await listAllMembers({ workspaceId });

  const membersWithField = members.filter((member) =>
    member.customFields.fields.some((field) => field.id === id),
  );

  const updatedMembers = membersWithField.map((member) => ({
    ...member,
    customFields: {
      fields: member.customFields.fields.filter((field) => field.id !== id),
    },
    updatedAt: new Date(),
  }));

  await updateManyMembers({
    members: updatedMembers,
  });
};

const updateCompanies = async ({ id, workspaceId }: Props) => {
  const companies = await listAllCompanies({ workspaceId });

  const companiesWithField = companies.filter((company) =>
    company.customFields.fields.some((field) => field.id === id),
  );

  const updatedCompanies = companiesWithField.map((company) => ({
    ...company,
    customFields: {
      fields: company.customFields.fields.filter((field) => field.id !== id),
    },
    updatedAt: new Date(),
  }));

  await updateManyCompanies({
    companies: updatedCompanies,
  });
};
