import { resend } from "@conquest/db/resend";
import { getUserById } from "@conquest/db/users/getUserById";
import { SuccessIntegrationEmail } from "@conquest/emails/templates/SuccessIntegrationEmail";
import { env } from "@conquest/env";
import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const integrationSuccessEmail = schemaTask({
  id: "integration-success-email",
  schema: z.object({
    integration: IntegrationSchema,
  }),
  run: async ({ integration }, { ctx }) => {
    if (ctx.environment.type === "DEVELOPMENT") return;

    const { created_by, details } = integration;
    const { source } = details;

    const user = await getUserById({ id: created_by });
    const { email } = user ?? {};

    const url = `${env.NEXT_PUBLIC_BASE_URL}/settings/integrations/${source?.toLowerCase()}`;

    await resend.emails.send({
      from: "Conquest <noreply@useconquest.com>",
      to: email ?? "",
      subject: `Your ${source} integration is ready`,
      react: SuccessIntegrationEmail({ source, url }),
    });
  },
});
