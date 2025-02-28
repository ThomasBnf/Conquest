type Props = {
  accessToken: string;
  id: string;
};

export const deleteWebhook = async ({ accessToken, id }: Props) => {
  const response = await fetch(`https://api.livestorm.co/v1/webhooks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to delete webhook");

  return { success: true };
};
