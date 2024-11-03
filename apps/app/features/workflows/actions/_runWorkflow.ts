"use server";

import { authAction } from "@/lib/authAction";
import { z } from "zod";
import { runWorkflow } from "../functions/runWorkflow";

export const _runWorkflow = authAction
  .metadata({
    name: "_runWorkflow",
  })
  .schema(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { id } }) => {
    await runWorkflow({ id });
  });
