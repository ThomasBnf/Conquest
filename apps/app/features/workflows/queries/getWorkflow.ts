import { authAction } from "@/lib/authAction";
import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { prisma } from "lib/prisma";
import { z } from "zod";

export const getWorkflow = authAction
  .metadata({
    name: "getWorkflow",
  })
  .schema(
    z.object({
      id: z.string().cuid(),
    }),
  )
  .action(async ({ parsedInput: { id } }) => {
    const workflow = await prisma.workflow.findUnique({
      where: {
        id,
      },
    });

    return WorkflowSchema.parse(workflow);
  });
