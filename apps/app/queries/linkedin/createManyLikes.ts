import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";
import type { Post } from "@conquest/zod/schemas/posts.schema";
import type { SocialActions } from "@conquest/zod/types/linkedin";
import { getLocaleByAlpha2 } from "country-locale-map";
import { createActivity } from "../activities/createActivity";
import { upsertMember } from "../members/upsertMember";
import { getPeople } from "./getPeople";

type Props = {
  linkedin: LinkedInIntegration;
  post: Post;
  likes: SocialActions["elements"];
};

export const createManyLikes = async ({ linkedin, post, likes }: Props) => {
  const { workspace_id } = linkedin;

  for (const like of likes) {
    const actorId = like.created.actor.split(":").pop();

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
    const locale = getLocaleByAlpha2(countryCode) ?? null;
    const avatar_url = profilePicture["displayImage~"]?.elements?.find(
      (element) => element?.artifact?.includes("800_800"),
    )?.identifiers?.[0]?.identifier;

    const member = await upsertMember({
      id,
      data: {
        linkedin_id: id,
        username: vanityName,
        first_name: localizedFirstName,
        last_name: localizedLastName,
        locale,
        avatar_url,
        job_title: localizedHeadline,
        source: "LINKEDIN",
        workspace_id,
      },
    });

    await createActivity({
      external_id: like.id ?? null,
      activity_type_key: "linkedin:like",
      message: "like",
      react_to: post.id,
      member_id: member.id,
      workspace_id,
    });
  }
};
