import type { Member } from "@conquest/zod/schemas/member.schema";
import type { WebClient } from "@slack/web-api";
import ISO6391 from "iso-639-1";
import { createMember } from "../member/createMember";
import { upsertProfile } from "../profile/upsertProfile";

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
          : null;
        const country = locale ? locale.split("-")[1] : null;

        const createdMember = await createMember({
          data: {
            first_name,
            last_name,
            primary_email: email,
            phones: phone ? [phone] : [],
            avatar_url: image_1024,
            job_title: title === "" ? null : title,
            language,
            country,
          },
          source: "SLACK",
          workspace_id,
        });

        await upsertProfile({
          external_id: id,
          attributes: {
            source: "SLACK",
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
