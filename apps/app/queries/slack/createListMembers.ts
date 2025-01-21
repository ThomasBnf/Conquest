import type { WebClient } from "@slack/web-api";
import { upsertMember } from "../members/upsertMember";

type Props = {
  web: WebClient;
  workspace_id: string;
};

export const createListMembers = async ({ web, workspace_id }: Props) => {
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
        console.log(locale);
        const { first_name, last_name, email, phone, image_1024, title } =
          profile;

        if (first_name === "slackbot" || !email) continue;

        const createdMember = await upsertMember({
          id,
          data: {
            first_name,
            last_name,
            primary_email: email,
            phones: phone ? [phone] : [],
            locale: locale?.replace("-", "_"),
            avatar_url: image_1024,
            job_title: title === "" ? null : title,
            source: "SLACK",
            workspace_id,
          },
        });

        if (!createdMember) continue;
      }
    }

    cursor = response_metadata?.next_cursor;
  } while (cursor);
};
