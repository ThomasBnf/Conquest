"use server";

import { EdgeSchema } from "@conquest/zod/edge.schema";
import { NodeSchema } from "@conquest/zod/node.schema";
import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateWorkflow = authAction
  .metadata({ name: "updateWorkflow" })
  .schema(
    z.object({
      id: z.string().cuid(),
      nodes: z.array(NodeSchema).optional(),
      edges: z.array(EdgeSchema).optional(),
      name: z.string().optional(),
      isPublished: z.boolean().optional(),
    }),
  )
  .action(
    async ({ ctx, parsedInput: { id, nodes, edges, name, isPublished } }) => {
      const updatedWorkflow = await prisma.workflow.update({
        where: {
          id,
          workspace_id: ctx.user.workspace_id,
        },
        data: {
          nodes,
          edges,
          name,
          isPublished,
        },
      });

      revalidatePath(`/${ctx.user.workspace.slug}/workflows/${id}`);
      return WorkflowSchema.parse(updatedWorkflow);
    },
  );
