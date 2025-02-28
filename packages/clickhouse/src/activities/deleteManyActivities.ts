import { client } from "../client";

type Props = {
  channel_id: string;
  react_to: string;
};

export const deleteManyActivities = async ({ channel_id, react_to }: Props) => {
  await client.query({
    query: `
      DELETE 
      FROM activities
      WHERE channel_id = '${channel_id}'
      AND react_to = '${react_to}'
    `,
  });
};
