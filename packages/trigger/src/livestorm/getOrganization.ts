type Props = {
  access_token: string;
};

export const getOrganization = async ({ access_token }: Props) => {
  const response = await fetch(
    "https://api.livestorm.co/v1/organization?include=organization",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        accept: "application/vnd.api+json",
      },
    },
  );

  return await response.json();
};
