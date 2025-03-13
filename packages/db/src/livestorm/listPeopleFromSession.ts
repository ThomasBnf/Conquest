import { PeopleSchema } from "@conquest/zod/types/livestorm";

type Props = {
  access_token: string;
  id: string;
};

export const listPeopleFromSession = async ({ access_token, id }: Props) => {
  const response = await fetch(
    `https://api.livestorm.co/v1/sessions/${id}/people`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    },
  );

  const { data } = PeopleSchema.parse(await response.json());
  return data;
};
