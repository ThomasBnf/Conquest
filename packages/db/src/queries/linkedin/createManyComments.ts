import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Post } from "@conquest/zod/schemas/posts.schema";
import type { SocialActions } from "@conquest/zod/types/linkedin";
import { createActivity } from "../activity/createActivity";
import { upsertMember } from "../member/upsertMember";
import { getPeople } from "./getPeople";

type Props = {
  linkedin: LinkedInIntegration;
  post: Post;
  comments: SocialActions["elements"];
};

export const createManyComments = async ({
  linkedin,
  post,
  comments,
}: Props) => {
  const { workspace_id } = linkedin;
  const createdMembers: Member[] = [];

  for (const comment of comments) {
    const actorId = comment.created.actor.split(":").pop();

    if (!actorId) continue;

    const people = await getPeople({ linkedin, people_id: actorId });

    const {
      id,
      vanityName,
      headline,
      profilePicture,
      localizedFirstName,
      localizedLastName,
      localizedHeadline,
    } = people;

    const countryCode = headline.preferredLocale.country;
    // const locale = getLocaleByAlpha2(countryCode) ?? null;
    const avatar_url = profilePicture["displayImage~"]?.elements?.find(
      (element) => element?.artifact?.includes("800_800"),
    )?.identifiers?.[0]?.identifier;

    const member = await upsertMember({
      id,
      data: {
        first_name: localizedFirstName,
        last_name: localizedLastName,
        // linkedin_url: `https://www.linkedin.com/in/${vanityName}`,
        // locale,
        avatar_url,
        job_title: localizedHeadline,
      },
      source: "LINKEDIN",
      workspace_id,
    });

    await createActivity({
      external_id: comment.id ?? null,
      activity_type_key: "linkedin:comment",
      message: comment.message?.text ?? "",
      reply_to: post.id,
      member_id: member.id,
      source: "LINKEDIN",
      workspace_id,
    });

    createdMembers.push(member);
  }

  return createdMembers;
};
