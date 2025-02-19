import { discourseClient } from "@conquest/db/discourse";
import { decrypt } from "@conquest/db/lib/decrypt";
import { getIntegrationBySource } from "@conquest/db/queries/integration/getIntegrationBySource";
import { DiscourseIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { CategorySchema } from "@conquest/zod/types/discourse";
import { protectedProcedure } from "../trpc";

export const listChannels = protectedProcedure.query(
  async ({ ctx: { user } }) => {
    const { workspace_id } = user;

    const integration = await getIntegrationBySource({
      source: "DISCOURSE",
      workspace_id,
    });

    const discourse = DiscourseIntegrationSchema.parse(integration);

    if (!discourse) return [];

    const { details } = discourse;
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
