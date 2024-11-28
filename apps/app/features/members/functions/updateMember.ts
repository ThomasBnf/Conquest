"use server";

import { MemberSchema } from "@conquest/zod/member.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";

export const updateMember = authAction
  .metadata({
    name: "updateMember",
  })
  .schema(MemberSchema.partial())
  .action(
    async ({
      ctx,
      parsedInput: {
        id,
        first_name,
        last_name,
        company_id,
        emails,
        phones,
        job_title,
        bio,
        tags,
      },
    }) => {
      const member = await prisma.members.findUnique({
        where: {
          id,
          workspace_id: ctx.user.workspace_id,
        },
        select: {
          first_name: true,
          last_name: true,
          full_name: true,
          emails: true,
          phones: true,
        },
      });

      const updatedFirstName = first_name ?? member?.first_name ?? "";
      const updatedLastName = last_name ?? member?.last_name ?? "";
      const updatedFullName = `${updatedFirstName} ${updatedLastName}`.trim();

      const updatedData = {
        ...(first_name && { first_name: updatedFirstName }),
        ...(last_name && { last_name: updatedLastName }),
        ...((first_name || last_name) && { full_name: updatedFullName }),
        ...(emails && { emails }),
        ...(phones && { phones }),
        ...(job_title && { job_title }),
        ...(bio && { bio }),
        ...(tags && { tags }),
        ...(company_id && { company_id }),
        search: generateSearchString({
          first_name: first_name ?? member?.first_name ?? null,
          last_name: last_name ?? member?.last_name ?? null,
          emails: emails ?? member?.emails ?? [],
          phones: phones ?? member?.phones ?? [],
        }),
      };

      const updatedMember = await prisma.members.update({
        where: {
          id,
          workspace_id: ctx.user.workspace_id,
        },
        data: updatedData,
      });

      revalidatePath(`/${ctx.user.workspace.slug}/members`);
      return MemberSchema.parse(updatedMember);
    },
  );

const generateSearchString = ({
  first_name,
  last_name,
  emails,
  phones,
}: {
  first_name: string | null;
  last_name: string | null;
  emails: string[];
  phones: string[];
}) => {
  const searchTerms = [first_name, last_name, ...emails, ...phones].filter(
    Boolean,
  );

  return searchTerms.join(" ").trim().toLowerCase();
};
