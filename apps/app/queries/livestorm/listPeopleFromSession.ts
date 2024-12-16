import type { People } from "@conquest/zod/schemas/types/livestorm";

type Props = {
  api_key: string;
  id: string;
};

export const listPeopleFromSession = async ({ api_key, id }: Props) => {
  const response = await fetch(
    `https://api.livestorm.co/v1/sessions/${id}/people`,
    {
      headers: {
        Authorization: api_key,
      },
    },
  );

  const { data } = await response.json();
  return data as People[];
};
