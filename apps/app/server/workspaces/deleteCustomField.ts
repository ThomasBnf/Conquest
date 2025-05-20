import { listAllMembers } from "@conquest/clickhouse/member/listAllMembers";
import { updateManyMembers } from "@conquest/clickhouse/member/updateManyMembers";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const deleteCustomField = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx: { user }, input }) => {
    const { workspaceId } = user;
    const { id } = input;

    const members = await listAllMembers({ workspaceId });

    await updateManyMembers({
      members: members.map((member) => ({
        ...member,
        customFields: {
          fields: member.customFields.fields.filter((field) => field.id !== id),
        },
      })),
    });

    return { success: true };
  });
