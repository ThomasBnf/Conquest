"use server";

import { MemberSchema } from "@conquest/zod/member.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import {
  type UpdateMember,
  updateMemberSchema,
} from "../schema/update-member.schema";

export const updateMember = authAction
  .metadata({
    name: "updateMember",
  })
  .schema(updateMemberSchema)
  .action(async ({ ctx, parsedInput }) => {
    const {
      id,
      first_name,
      last_name,
      emails,
      phones,
      job_title,
      address,
      bio,
      tags,
    } = updateMemberSchema.parse(parsedInput);

    const member = await prisma.member.findUnique({
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

    const data: UpdateMember & { full_name?: string } = { id };

    const updatedFirstName = first_name
      ? first_name
      : (member?.first_name ?? "");
    const updatedLastName = last_name ? last_name : (member?.last_name ?? "");

    if (first_name) data.first_name = updatedFirstName;
    if (last_name) data.last_name = updatedLastName;
    if (first_name || last_name) {
      data.full_name =
        `${updatedFirstName ?? ""} ${updatedLastName ?? ""}`.trim();
    }
    if (emails) data.emails = emails;
    if (phones) data.phones = phones;
    if (job_title) data.job_title = job_title;
    if (address) data.address = address;
    if (bio) data.bio = bio;
    if (tags) data.tags = tags;

    const updatedMember = await prisma.member.update({
      where: {
        id,
        workspace_id: ctx.user.workspace_id,
      },
      data: {
        ...data,
        search: search({
          first_name: data.first_name ?? member?.first_name ?? null,
          last_name: data.last_name ?? member?.last_name ?? null,
          emails: data.emails ?? member?.emails ?? [],
          phones: data.phones ?? member?.phones ?? [],
        }),
      },
    });

    revalidatePath(`/${ctx.user.workspace.slug}/members`);
    return MemberSchema.parse(updatedMember);
  });

const search = ({
  first_name,
  last_name,
  emails,
  phones,
}: {
  first_name: string | null | undefined;
  last_name: string | null | undefined;
  emails: string[] | undefined;
  phones: string[] | undefined;
}) => {
  const searchTerms = [
    first_name,
    last_name,
    ...(emails ?? []),
    ...(phones ?? []),
  ].filter(Boolean);

  return searchTerms.join(" ").trim().toLowerCase();
};
