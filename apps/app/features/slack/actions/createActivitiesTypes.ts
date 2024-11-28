"use server";

import { authAction } from "@/lib/authAction";
import { prisma } from "@conquest/database";

export const createActivitiesTypes = authAction
  .metadata({
    name: "createActivitiesTypes",
  })
  .action(async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    await prisma.activities_types.createMany({
      data: [
        {
          name: "Send message",
          source: "SLACK",
          key: "slack:post",
          weight: 4,
          deletable: false,
          workspace_id,
        },
        {
          name: "Reply to message",
          source: "SLACK",
          key: "slack:reply",
          weight: 2,
          deletable: false,
          workspace_id,
        },
        {
          name: "Invitation",
          source: "SLACK",
          key: "slack:invitation",
          weight: 6,
          deletable: false,
          workspace_id,
        },
        {
          name: "Add reaction",
          source: "SLACK",
          key: "slack:reaction",
          weight: 0,
          deletable: false,
          workspace_id,
        },
      ],
    });
  });
