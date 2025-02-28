import { updateIntegration as _updateIntegration } from "@conquest/clickhouse/integrations/updateIntegration";
import { encrypt } from "@conquest/clickhouse/utils/encrypt";
import { STATUS } from "@conquest/zod/enum/status.enum";
import { IntegrationDetailsSchema } from "@conquest/zod/schemas/integration.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const updateIntegration = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      external_id: z.string().optional(),
      connected_at: z.date().optional(),
      details: IntegrationDetailsSchema.optional(),
      status: STATUS.optional(),
      trigger_token: z.string().optional(),
      expires_at: z.date().optional(),
      created_by: z.string().optional(),
    }),
  )
  .mutation(async ({ input }) => {
    const {
      id,
      external_id,
      connected_at,
      details,
      status,
      trigger_token,
      expires_at,
      created_by,
    } = input;

    if (details?.source === "Discourse") {
      const { community_url, api_key } = details;

      const encryptedCommunityUrl = await encrypt(community_url);
      const encryptedApiKey = await encrypt(api_key);

      details.community_url = encryptedCommunityUrl.token;
      details.community_url_iv = encryptedCommunityUrl.iv;
      details.api_key = encryptedApiKey.token;
      details.api_key_iv = encryptedApiKey.iv;
    }

    return await _updateIntegration({
      id,
      external_id,
      connected_at,
      details,
      status,
      trigger_token,
      expires_at,
      created_by,
    });
  });
