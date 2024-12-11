"use server";

import { CustomError } from "@/lib/safeAction";
import {
  type IntegrationDetails,
  IntegrationSchema,
} from "@conquest/zod/integration.schema";
import { tasks } from "@trigger.dev/sdk/v3";
import { prisma } from "lib/prisma";

type Props = {
  external_id: string;
  workspace_id: string;
  details: IntegrationDetails;
};

export const createIntegration = async ({
  external_id,
  workspace_id,
  details,
}: Props) => {
  const integrationExist = await prisma.integrations.findFirst({
    where: {
      external_id,
    },
  });

  if (integrationExist) {
    return new CustomError("Slack workspace already connected", 400);
  }

  const integration = await prisma.integrations.create({
    data: {
      external_id,
      status: "CONNECTED",
      details,
      workspace_id,
    },
  });

  const parsedIntegration = IntegrationSchema.parse(integration);

  if (parsedIntegration.details.source === "DISCOURSE") {
    tasks.trigger("install-discourse", { integration: parsedIntegration });
  }

  return parsedIntegration;
};
