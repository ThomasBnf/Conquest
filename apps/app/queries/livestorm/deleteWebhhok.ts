type Props = {
  accessToken: string;
  id: string;
};

export const deleteWebhook = async ({ accessToken, id }: Props) => {
  const response = await fetch(`https://api.livestorm.co/v1/webhooks/${id}`, {
    method: "DELETE",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return { success: true };
};
