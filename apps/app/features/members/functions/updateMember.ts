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
    const { id, emails, phones, job_title, address, bio, tags } =
      updateMemberSchema.parse(parsedInput);

    const member = await prisma.member.findUnique({
      where: {
        id,
        workspace_id: ctx.user.workspace_id,
      },
      select: {
        first_name: true,
        last_name: true,
        emails: true,
        phones: true,
      },
    });

    const data: UpdateMember = { id };
    if (emails) data.emails = emails;
    if (phones) data.phones = phones;
    if (job_title !== undefined) data.job_title = job_title;
    if (address !== undefined) data.address = address;
    if (bio !== undefined) data.bio = bio;
    if (tags) data.tags = tags;

    const updatedMember = await prisma.member.update({
      where: {
        id,
        workspace_id: ctx.user.workspace_id,
      },
      data: {
        ...data,
        search:
          `${member?.first_name?.toLowerCase() ?? ""} ${member?.last_name?.toLowerCase() ?? ""} ${emails?.join(" ").toLowerCase() ?? member?.emails?.join(" ").toLowerCase() ?? ""} ${phones?.join(" ").toLowerCase() ?? member?.phones?.join(" ").toLowerCase() ?? ""}`.trim(),
      },
    });

    revalidatePath(`/${ctx.user.workspace.slug}/members`);
    return MemberSchema.parse(updatedMember);
  });
