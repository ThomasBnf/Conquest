import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { z } from "zod";

export const updateSlackMember = safeAction
  .metadata({ name: "updateSlackMember" })
  .schema(
    z.object({
      slack_id: z.string(),
      first_name: z.string(),
      last_name: z.string(),
      phone: z.string(),
      avatar_url: z.string().optional(),
      job_title: z.string(),
      workspace_id: z.string(),
    }),
  )
  .action(
    async ({
      parsedInput: {
        slack_id,
        first_name,
        last_name,
        phone,
        avatar_url,
        job_title,
        workspace_id,
      },
    }) => {
      const currentMember = await prisma.member.findUnique({
        where: {
          slack_id,
        },
      });

      const { emails, phones } = currentMember ?? {};

      const updatedPhones = new Set(phones);
      if (phone) updatedPhones.add(phone);

      const newSearch = `${first_name} ${last_name} ${emails?.join(" ") ?? ""} ${Array.from(updatedPhones).join(" ")}`;

      return await prisma.member.update({
        where: {
          slack_id,
          workspace_id,
        },
        data: {
          first_name,
          last_name,
          full_name: `${first_name} ${last_name}`,
          phones: Array.from(updatedPhones).filter(Boolean),
          avatar_url,
          job_title,
          search: newSearch,
        },
      });
    },
  );
