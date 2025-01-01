import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";
import type { SocialActionsResponse } from "@conquest/zod/schemas/types/linkedin";
import { createActivity } from "../activities/createActivity";
import { getActivityType } from "../activity-type/getActivityType";
import { upsertMember } from "../members/upsertMember";
import { getPeople } from "./getPeople";

type Props = {
  linkedin: LinkedInIntegration;
  comments: SocialActionsResponse["elements"];
};

export const createManyComments = async ({ linkedin, comments }: Props) => {
  const { workspace_id } = linkedin;

  const comment_type = await getActivityType({
    workspace_id,
    key: "linkedin:comment",
  });

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

    const location = headline.preferredLocale.country;
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
        location,
        avatar_url,
        job_title: localizedHeadline,
        source: "LINKEDIN",
        // joined_at: joinedAt,
        workspace_id,
      },
    });

    await createActivity({
      external_id: comment.id,
      activity_type_id: comment_type.id,
      message: comment.message.text,
      member_id: member.id,
      workspace_id,
    });
  }
};
