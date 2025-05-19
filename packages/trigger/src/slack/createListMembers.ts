import { createMember } from "@conquest/clickhouse/member/createMember";
import { createProfile } from "@conquest/clickhouse/profile/createProfile";
import type { WebClient } from "@slack/web-api";
import { logger } from "@trigger.dev/sdk/v3";
import ISO6391 from "iso-639-1";

type Props = {
  web: WebClient;
  workspaceId: string;
};

export const createListMembers = async ({ web, workspaceId }: Props) => {
  let cursor: string | undefined;

  while (true) {
    const { members, response_metadata } = await web.users.list({
      limit: 100,
      include_locale: true,
      cursor,
    });

    for (const member of members ?? []) {
      const { id, deleted: isDeleted, is_bot: isBot, profile } = member;

      if (!id) continue;

      if (profile && !isDeleted && !isBot) {
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

        if (first_name === "slackbot" || !email) continue;

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

        await createProfile({
          externalId: id,
          attributes: {
            source: "Slack",
            realName: real_name ?? "",
          },
          memberId: createdMember.id,
          workspaceId,
        });
      }
    }

    cursor = response_metadata?.next_cursor;
    logger.info("cursor", { cursor });
    if (!cursor) break;
  }
};
