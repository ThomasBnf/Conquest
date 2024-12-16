import { listPasEvents } from "@/queries/livestorm/listPastEvents";
import { listWorkspaces } from "@/queries/workspaces/listWorkspaces";
import { LivestormIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schedules } from "@trigger.dev/sdk/v3";

export const cronDaily = schedules.task({
  id: "cron-daily",
  cron: "0 0 * * *",
  run: async (_, { ctx }) => {
    if (ctx.environment.type !== "PRODUCTION") return;

    const workspaces = await listWorkspaces();

    for (const workspace of workspaces) {
      const { integrations } = workspace;

      const livestormIntegration = LivestormIntegrationSchema.parse(
        integrations.find(
          (integration) => integration.details.source === "LIVESTORM",
        ),
      );

      if (!livestormIntegration) continue;
      const { api_key } = livestormIntegration.details;

      await listPasEvents({
        api_key,
        workspace_id: workspace.id,
      });
    }
  },
});
