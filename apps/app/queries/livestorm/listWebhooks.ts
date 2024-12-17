type Props = {
  accessToken: string;
};

export const listWebhooks = async ({ accessToken }: Props) => {
  const response = await fetch("https://api.livestorm.co/v1/webhooks", {
    method: "GET",
    headers: {
      accept: "application/vnd.api+json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const { data } = await response.json();
  console.dir(data, { depth: 100 });
  return data;
};
