import { getUserById } from "@conquest/db/users/getUserById";
import { env } from "@conquest/env";
import { resend } from "@conquest/resend";
import SuccessIntegration from "@conquest/resend/emails/sucess-integration";
import { IntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { render } from "@react-email/render";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";

export const integrationSuccessEmail = schemaTask({
  id: "integration-success-email",
  schema: z.object({
    integration: IntegrationSchema,
  }),
  run: async ({ integration }, { ctx }) => {
    if (ctx.environment.type === "DEVELOPMENT") return;

    const { createdBy, details } = integration;
    const { source } = details;

    const user = await getUserById({ id: createdBy });
    const { email } = user ?? {};

    const url = `${env.NEXT_PUBLIC_BASE_URL}/settings/integrations/${source?.toLowerCase()}`;

    if (!email) return;

    const html = await render(SuccessIntegration({ source, url }), {
      pretty: true,
    });

    const { data, error } = await resend.emails.send({
      from: "Conquest <noreply@useconquest.com>",
      to: email,
      subject: `Your ${source} integration is ready`,
      html,
    });

    logger.info("Email sent", { data, error });
  },
});
