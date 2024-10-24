"use server";

import { safeAction } from "@/lib/safeAction";
import { z } from "zod";
import { listMembers } from "../queries/listMembers";

export const listMembersAction = safeAction
  .metadata({ name: "listMembersAction" })
  .schema(
    z.object({
      page: z.number(),
      search: z.string(),
      id: z.string(),
      desc: z.boolean(),
    }),
  )
  .action(async ({ parsedInput: { page, search } }) => {
    const rMembers = await listMembers({ page, search });
    return rMembers?.data;
  });
