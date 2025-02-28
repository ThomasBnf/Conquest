import { getIntegrationBySource } from "@conquest/clickhouse/integrations/getIntegrationBySource";
import { ActivitySchema } from "@conquest/zod/schemas/activity.schema";
import { GithubIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const getLink = protectedProcedure
  .input(
    z.object({
      activity: ActivitySchema,
    }),
  )
  .query(async ({ ctx: { user }, input }) => {
    const { workspace_id } = user;
    const { external_id, reply_to } = input.activity;

    if (!external_id || !reply_to) return null;

    const github = GithubIntegrationSchema.parse(
      await getIntegrationBySource({
        source: "Github",
        workspace_id,
      }),
    );

    const { details } = github;
    const { owner, name } = details;

    if (reply_to) {
      return `https://github.com/${owner}/${name}/${reply_to}#issuecomment-${external_id}`;
    }

    return `https://github.com/${owner}/${name}/${external_id}`;
  });
