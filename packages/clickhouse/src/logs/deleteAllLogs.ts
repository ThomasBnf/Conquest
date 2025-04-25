import { client } from "../client";

type Props = {
  workspaceId: string;
};

export const deleteAllLogs = async ({ workspaceId }: Props) => {
  await client.query({
    query: `
        ALTER TABLE log
        DELETE
        WHERE workspaceId = '${workspaceId}'
    `,
  });
};
