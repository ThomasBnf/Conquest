import { discourseClient } from "@conquest/db/discourse";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { CategorySchema } from "@conquest/zod/types/discourse";
import { protectedProcedure } from "../trpc";

export const listChannels = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const integration = DiscourseIntegrationSchema.parse(
      await getIntegrationBySource({
        source: "Discourse",
        workspace_id,
      }),
    );

    const { details } = integration;
    const { community_url, api_key, api_key_iv } = details;

    const decryptedApiKey = await decrypt({
      access_token: api_key,
      iv: api_key_iv,
    });

    const client = discourseClient({
      api_key: decryptedApiKey,
      community_url,
    });

    const { categories } = await client.getSite();

    return CategorySchema.array().parse(categories);
  },
);
