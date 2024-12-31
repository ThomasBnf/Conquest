import type { LinkedInIntegration } from "@conquest/zod/schemas/integration.schema";
import type { PeopleResponse } from "@conquest/zod/schemas/types/linkedin";

type Props = {
  linkedin: LinkedInIntegration;
  people_id: string;
};

export const getPeople = async ({ linkedin, people_id }: Props) => {
  const { access_token } = linkedin.details;

  const peopleResponse = await fetch(
    `https://api.linkedin.com/v2/people/(id:${people_id})?projection=(
      id,
      firstName,
      lastName,
      localizedFirstName,
      localizedLastName,
      headline,
      localizedHeadline,
      vanityName,
      profilePicture(displayImage~digitalmediaAsset:playableStreams)
    )`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "LinkedIn-Version": "202411",
        "Content-Type": "application/json",
        "X-RestLi-Protocol-Version": "2.0.0",
      },
    },
  );

  if (!peopleResponse.ok) {
    throw new Error(
      `Failed to fetch LinkedIn people: ${peopleResponse.statusText}`,
    );
  }

  const peopleData = (await peopleResponse.json()) as PeopleResponse;

  console.log("@peopleData");
  console.dir(peopleData, { depth: 100 });

  return peopleData;
};
