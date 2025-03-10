import { resend } from "@conquest/db/resend";
import { getUserById } from "@conquest/db/users/getUserById";
import { getWorkspace } from "@conquest/db/workspaces/getWorkspace";
import { SuccessIntegrationEmail } from "@conquest/emails/SuccessIntegrationEmail";
import { env } from "@conquest/env";
import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const integrationSuccessEmail = schemaTask({
  id: "integration-success-email",
  schema: z.object({
    integration: IntegrationSchema,
    workspace_id: z.string(),
  }),
  run: async ({ integration, workspace_id }, { ctx }) => {
    if (ctx.environment.type === "DEVELOPMENT") return;

    const { created_by, details } = integration;
    const { source } = details;

    const user = await getUserById({ id: created_by });
    const { email } = user ?? {};

    const workspace = await getWorkspace({ id: workspace_id });
    const { slug } = workspace ?? {};

    const url = `${env.NEXT_PUBLIC_BASE_URL}/${slug}/settings/integrations/${source?.toLowerCase()}`;

    await resend.emails.send({
      from: "Conquest <noreply@useconquest.com>",
      to: email ?? "",
      subject: `Your ${source} integration is ready`,
      react: SuccessIntegrationEmail({ source, url }),
    });
  },
});
