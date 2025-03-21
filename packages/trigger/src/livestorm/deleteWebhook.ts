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

  if (!response.ok) {
    console.log(response.statusText);
    const data = await response.json();
    console.log("deleteWebhook", data);
    throw new Error("Failed to delete webhook");
  }

  return { success: true };
};
