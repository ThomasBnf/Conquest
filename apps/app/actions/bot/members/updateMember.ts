import { prisma } from "@/lib/prisma";
import { safeAction } from "@/lib/safeAction";
import { z } from "zod";

export const updateMember = safeAction
  .metadata({ name: "updateMember" })
  .schema(
    z.object({
      slack_id: z.string(),
      first_name: z.string(),
      last_name: z.string(),
      phone: z.string(),
      avatar_url: z.string().optional(),
      job_title: z.string(),
    }),
  )
  .action(
    async ({
      parsedInput: {
        slack_id,
        first_name,
        last_name,
        phone: newPhone,
        avatar_url,
        job_title,
      },
    }) => {
      const currentMember = await prisma.member.findUnique({
        where: {
          slack_id,
        },
      });

      const { emails, phone } = currentMember ?? {};
      const newSearch = `${first_name} ${last_name} ${emails} ${newPhone ?? phone}`;

      return await prisma.member.update({
        where: {
          slack_id,
        },
        data: {
          first_name,
          last_name,
          full_name: `${first_name} ${last_name}`,
          phone: newPhone ?? phone,
          avatar_url,
          job_title,
          search: newSearch,
        },
      });
    },
  );
