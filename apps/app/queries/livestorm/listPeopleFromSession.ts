import type { People } from "@conquest/zod/types/livestorm";

type Props = {
  accessToken: string;
  id: string;
};

export const listPeopleFromSession = async ({ accessToken, id }: Props) => {
  const response = await fetch(
    `https://api.livestorm.co/v1/sessions/${id}/people`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const { data } = await response.json();
  return data as People[];
};
