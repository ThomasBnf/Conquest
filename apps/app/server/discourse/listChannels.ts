import { discourseClient } from "@conquest/clickhouse/discourse";
import { getIntegrationBySource } from "@conquest/clickhouse/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/clickhouse/utils/decrypt";
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
    const { community_url, community_url_iv, api_key, api_key_iv } = details;

    const decryptedCommunityUrl = await decrypt({
      access_token: community_url,
      iv: community_url_iv,
    });

    const decryptedApiKey = await decrypt({
      access_token: api_key,
      iv: api_key_iv,
    });

    const client = discourseClient({
      community_url: decryptedCommunityUrl,
      api_key: decryptedApiKey,
    });
    const { categories } = await client.getSite();

    return CategorySchema.array().parse(categories);
  },
);
