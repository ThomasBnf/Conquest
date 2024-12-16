import type { Member } from "@conquest/zod/schemas/member.schema";
import type { WebClient } from "@slack/web-api";
import { upsertMember } from "../members/upsertMember";

type Props = {
  web: WebClient;
  workspace_id: string;
};

export const createListMembers = async ({ web, workspace_id }: Props) => {
  let cursor: string | undefined;
  const listOfMembers: Member[] = [];

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

        const localeFormatted = new Intl.DisplayNames(["en"], {
          type: "region",
        }).of(locale?.split("-")?.[1] ?? "");

        const createdMember = await upsertMember({
          id,
          source: "SLACK",
          first_name,
          last_name,
          email,
          phone: phone ?? null,
          locale: localeFormatted,
          avatar_url: image_1024,
          job_title: title,
          workspace_id,
          isDeleted,
        });

        if (!createdMember) continue;

        listOfMembers.push(createdMember);
      }
    }

    cursor = response_metadata?.next_cursor;
  } while (cursor);

  return listOfMembers;
};
