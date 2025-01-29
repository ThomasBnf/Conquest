import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import type { WebClient } from "@slack/web-api";
import { createMember } from "../members/createMember";

type Props = {
  web: WebClient;
  workspace_id: string;
};

export const createListMembers = async ({ web, workspace_id }: Props) => {
  const createdMembers: MemberWithCompany[] = [];
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

        const createdMember = await createMember({
          data: {
            slack_id: id,
            first_name,
            last_name,
            primary_email: email,
            phones: phone ? [phone] : [],
            avatar_url: image_1024,
            job_title: title === "" ? null : title,
            locale: locale ? locale.replace("-", "_") : null,
          },
          source: "SLACK",
          workspace_id,
        });

        createdMembers?.push(createdMember);
      }
    }

    cursor = response_metadata?.next_cursor;
  } while (cursor);

  return createdMembers;
};
