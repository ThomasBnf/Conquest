import { protectedProcedure } from "@/server/trpc";
import { listAllCompanies } from "@conquest/db/company/listAllCompanies";
import { updateManyCompanies } from "@conquest/db/company/updateManyCompanies";
import { deleteField as _deleteField } from "@conquest/db/custom-fields/deleteField";
import { listAllMembers } from "@conquest/db/member/listAllMembers";
import { updateManyMembers } from "@conquest/db/member/updateManyMembers";
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
    member.customFields.some((field) => field.id === id),
  );

  const updatedMembers = membersWithField.map((member) => ({
    ...member,
    customFields: member.customFields.filter((field) => field.id !== id),
  }));

  await updateManyMembers({
    members: updatedMembers,
  });
};

const updateCompanies = async ({ id, workspaceId }: Props) => {
  const companies = await listAllCompanies({ workspaceId });

  const companiesWithField = companies.filter((company) =>
    company.customFields.some((field) => field.id === id),
  );

  const updatedCompanies = companiesWithField.map((company) => ({
    ...company,
    customFields: company.customFields.filter((field) => field.id !== id),
  }));

  await updateManyCompanies({
    companies: updatedCompanies,
  });
};
