"use server";

import { EdgeSchema } from "@conquest/zod/edge.schema";
import { NodeSchema } from "@conquest/zod/schemas/node.schema";
import { WorkflowSchema } from "@conquest/zod/workflow.schema";
import { authAction } from "lib/authAction";
import { prisma } from "lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const updateWorkflow = authAction
  .metadata({
    name: "updateWorkflow",
  })
  .schema(
    z.object({
      id: z.string().cuid(),
      nodes: z.array(NodeSchema).optional(),
      edges: z.array(EdgeSchema).optional(),
      name: z.string().optional(),
      description: z.string().nullable().optional(),
      published: z.boolean().optional(),
    }),
  )
  .action(
    async ({
      ctx: { user },
      parsedInput: { id, nodes, edges, name, description, published },
    }) => {
      const slug = user.workspace.slug;
      const workspace_id = user.workspace_id;

      const updatedWorkflow = await prisma.workflows.update({
        where: {
          id,
          workspace_id,
        },
        data: {
          nodes,
          edges,
          name,
          description,
          published,
        },
      });

      revalidatePath(`/${slug}/workflows/${id}`);
      return WorkflowSchema.parse(updatedWorkflow);
    },
  );
