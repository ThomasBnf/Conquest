import type { Source } from "@conquest/zod/enum/source.enum";
import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { prisma } from "../prisma";

type Props = {
  source: Source;
  workspaceId: string;
};

export const getIntegrationBySource = async ({
  source,
  workspaceId,
}: Props) => {
  if (!source || !workspaceId) return null;

  const integration = await prisma.integration.findFirst({
    where: {
      details: {
        path: ["source"],
        equals: source,
      },
      workspaceId,
    },
  });

  console.log("integration", integration);

  if (!integration) return null;
  return IntegrationSchema.parse(integration);
};
