import { client } from "../client";

type Props = {
  workspace_id: string;
};

export const deleteAllLogs = async ({ workspace_id }: Props) => {
  await client.query({
    query: `
        ALTER TABLE log
        DELETE
        WHERE workspace_id = '${workspace_id}'
    `,
  });
};
