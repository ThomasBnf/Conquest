import type { Source } from "@conquest/zod/enum/source.enum";
import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { prisma } from "../prisma";

type Props = {
  source: Source;
  workspace_id: string;
};

export const getIntegrationBySource = async ({
  source,
  workspace_id,
}: Props) => {
  if (!source || !workspace_id) return undefined;

  const integration = await prisma.integration.findFirst({
    where: {
      details: {
        path: ["source"],
        equals: source,
      },
      workspace_id,
    },
  });

  if (!integration) return undefined;
  return IntegrationSchema.parse(integration);
};
