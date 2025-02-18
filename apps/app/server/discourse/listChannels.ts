import { discourseClient } from "@conquest/db/discourse";
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
    const { community_url, api_key } = details;

    const client = discourseClient({ community_url, api_key });
    const { categories } = await client.getSite();

    const isOk = CategorySchema.array().safeParse(categories);

    console.dir(isOk.error, { depth: 100 });

    return isOk.data;
  },
);
