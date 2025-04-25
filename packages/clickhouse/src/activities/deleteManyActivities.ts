import { client } from "../client";

type Props = {
  channelId: string;
  reactTo: string;
};

export const deleteManyActivities = async ({ channelId, reactTo }: Props) => {
  await client.query({
    query: `
      ALTER TABLE activity
      DELETE WHERE channelId = '${channelId}'
      AND reactTo = '${reactTo}'
    `,
  });
};
