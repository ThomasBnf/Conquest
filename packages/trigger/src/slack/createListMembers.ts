import { createMember } from "@conquest/clickhouse/members/createMember";
import { createProfile } from "@conquest/clickhouse/profiles/createProfile";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { WebClient } from "@slack/web-api";
import ISO6391 from "iso-639-1";

type Props = {
  web: WebClient;
  workspace_id: string;
};

export const createListMembers = async ({ web, workspace_id }: Props) => {
  const createdMembers: Member[] = [];
  let cursor: string | undefined;

  do {
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
        const { first_name, last_name, email, phone, image_1024, title } =
          profile;

        if (first_name === "slackbot" || !email) continue;

        const language = locale
          ? ISO6391.getName(locale.split("-")[0] ?? "")
          : "";
        const country = locale ? locale.split("-")[1] : "";

        const createdMember = await createMember({
          first_name,
          last_name,
          primary_email: email,
          phones: phone ? [phone] : [],
          avatar_url: image_1024,
          job_title: title,
          language,
          country,
          source: "Slack",
          workspace_id,
        });

        await createProfile({
          external_id: id,
          attributes: {
            source: "Slack",
          },
          member_id: createdMember.id,
          workspace_id,
        });

        createdMembers.push(createdMember);
      }
    }

    cursor = response_metadata?.next_cursor;
  } while (cursor);

  return createdMembers;
};
