import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";
import type {
  PeopleResponse,
  SocialActionsResponse,
} from "@conquest/zod/schemas/types/linkedin";
import { createActivity } from "../activities/createActivity.js";
import { getActivityType } from "../activity-type/getActivityType.js";
import { upsertMember } from "../members/upsertMember.js";

type Props = {
  linkedin: LinkedInIntegration;
  likes: SocialActionsResponse["elements"];
};

export const createManyLikes = async ({ linkedin, likes }: Props) => {
  const { details, workspace_id } = linkedin;
  const { access_token } = details;

  const like_type = await getActivityType({
    workspace_id,
    key: "linkedin:like",
  });

  for (const like of likes) {
    const actorId = like.created.actor.split(":").pop();

    const peoplesResponse = await fetch(
      `https://api.linkedin.com/v2/people/(id:${actorId})`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "LinkedIn-Version": "202411",
          "Content-Type": "application/json",
          "X-RestLi-Protocol-Version": "2.0.0",
        },
      },
    );
    const peopleData = (await peoplesResponse.json()) as PeopleResponse;
    console.log("@peopleData", peopleData);

    const {
      id,
      vanityName,
      headline,
      profilePicture,
      localizedFirstName,
      localizedLastName,
      localizedHeadline,
    } = peopleData;

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
      external_id: like.id,
      activity_type_id: like_type.id,
      message: like.message.text,
      member_id: member.id,
      workspace_id,
    });
  }
};
