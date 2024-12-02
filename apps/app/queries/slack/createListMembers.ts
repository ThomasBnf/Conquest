import { upsertMember } from "@/features/members/functions/upsertMember";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { WebClient } from "@slack/web-api";

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
        const { locale: localisation } = member;
        const {
          first_name,
          last_name,
          real_name,
          email,
          phone,
          image_1024,
          title,
        } = profile;

        if (first_name === "slackbot") continue;

        const rMember = await upsertMember({
          id,
          source: "SLACK",
          first_name,
          last_name,
          full_name: real_name,
          email,
          phone,
          localisation,
          avatar_url: image_1024,
          job_title: title,
          workspace_id,
        });

        const createdMember = rMember?.data;

        if (!createdMember) continue;

        listOfMembers.push(createdMember);
      }
    }

    cursor = response_metadata?.next_cursor;
  } while (cursor);

  return listOfMembers;
};
