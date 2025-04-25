import { discourseClient } from "@conquest/db/discourse";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { CategorySchema } from "@conquest/zod/types/discourse";
import { protectedProcedure } from "../trpc";

export const listChannels = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspaceId } = user;

    const integration = DiscourseIntegrationSchema.parse(
      await getIntegrationBySource({
        source: "Discourse",
        workspaceId,
      }),
    );

    const { details } = integration;
    const { communityUrl, apiKey, apiKeyIv } = details;

    const decryptedApiKey = await decrypt({
      accessToken: apiKey,
      iv: apiKeyIv,
    });

    const client = discourseClient({
      apiKey: decryptedApiKey,
      communityUrl,
    });

    const { categories } = await client.getSite();

    return CategorySchema.array().parse(categories);
  },
);
