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
  const { details, workspace_id } = linkedin;
  const { access_token } = details;

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

    const location = Object.values(headline.localized)[0]?.split(" ").pop();

    const member = await upsertMember({
      id,
      data: {
        linkedin_id: id,
        username: vanityName,
        first_name: localizedFirstName,
        last_name: localizedLastName,
        location,
        avatar_url: profilePicture.displayImage,
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
