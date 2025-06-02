import { client } from "@conquest/clickhouse/client";
import { createMember } from "@conquest/clickhouse/member/createMember";
import { createProfile } from "@conquest/clickhouse/profile/createProfile";
import { getProfile } from "@conquest/clickhouse/profile/getProfile";
import { getIntegrationBySource } from "@conquest/db/integrations/getIntegrationBySource";
import { decrypt } from "@conquest/db/utils/decrypt";
import { listWorkspaces } from "@conquest/db/workspaces/listWorkspaces";
import { SlackIntegrationSchema } from "@conquest/zod/schemas/integration.schema";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { WebClient } from "@slack/web-api";
import { logger } from "@trigger.dev/sdk/v3";
import ISO6391 from "iso-639-1";

export const checkSlackProfiles = async () => {
  const workspaces = await listWorkspaces();

  for (const workspace of workspaces) {
    const { id: workspaceId } = workspace;
    logger.info(workspace.name, { workspaceId });

    const integration = await getIntegrationBySource({
      source: "Slack",
      workspaceId,
    });

    if (!integration) continue;

    const slack = SlackIntegrationSchema.parse(integration);
    const { accessToken, accessTokenIv } = slack.details;

    const token = await decrypt({
      accessToken,
      iv: accessTokenIv,
    });

    const web = new WebClient(token);

    try {
      let cursor: string | undefined;

      while (true) {
        const { members, response_metadata } = await web.users.list({
          limit: 100,
          include_locale: true,
          cursor,
        });

        for (const member of members ?? []) {
          const {
            id,
            name,
            deleted: isDeleted,
            is_bot: isBot,
            profile,
          } = member;

          if (name === "slackbot" || !id || isDeleted || isBot || !profile) {
            continue;
          }

          const { locale } = member;
          const {
            first_name,
            last_name,
            email,
            phone,
            image_1024,
            title,
            real_name,
          } = profile;

          if (!email) continue;

          const existingProfile = await getProfile({
            externalId: id,
            workspaceId,
          });

          if (existingProfile) continue;

          const sanitizedEmail =
            email.toLowerCase().trim()?.replace(/'/g, "\\'") ?? "";

          const result = await client.query({
            query: `
              SELECT * 
              FROM member FINAL
              WHERE primaryEmail = '${sanitizedEmail}'
              AND workspaceId = '${workspaceId}'
            `,
          });

          const { data } = await result.json();
          const existingMember = data[0];

          let memberId: string | undefined;

          if (!existingMember) {
            logger.info("no member found", { member });

            const language = locale
              ? ISO6391.getName(locale.split("-")[0] ?? "")
              : "";
            const country = locale ? locale.split("-")[1] : "";

            const createdMember = await createMember({
              firstName: first_name,
              lastName: last_name,
              primaryEmail: email,
              emails: [email],
              phones: phone ? [phone] : [],
              avatarUrl: image_1024,
              jobTitle: title,
              language,
              country,
              source: "Slack",
              workspaceId,
            });

            memberId = createdMember.id;
          } else {
            memberId = MemberSchema.parse(data[0]).id;
          }

          if (!memberId) continue;

          const sanitizedRealName = real_name?.replace(/'/g, "\\'") ?? "";

          await createProfile({
            externalId: id,
            attributes: {
              source: "Slack",
              realName: sanitizedRealName,
            },
            memberId,
            workspaceId,
          });
        }

        cursor = response_metadata?.next_cursor;
        if (!cursor) break;
      }
    } catch (error) {
      logger.error("error", { error });
    }
  }
};
