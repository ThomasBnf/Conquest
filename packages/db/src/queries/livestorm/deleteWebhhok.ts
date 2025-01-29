type Props = {
  accessToken: string;
  id: string;
};

export const deleteWebhook = async ({ accessToken, id }: Props) => {
  await fetch(`https://api.livestorm.co/v1/webhooks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
  });

  return { success: true };
};
