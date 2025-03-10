import { client } from "../client";

type Props =
  | { id: string; name: string }
  | { external_id: string; name: string; workspace_id: string };

export const updateChannel = async (props: Props) => {
  if ("id" in props) {
    const { id, name } = props;
    await client.query({
      query: `
        ALTER TABLE channel
        UPDATE 
          name = '${name}'
        WHERE id = '${id}'
      `,
    });
  }

  if ("external_id" in props) {
    const { external_id, name, workspace_id } = props;

    await client.query({
      query: `
        ALTER TABLE channel
        UPDATE 
          name = '${name}'
        WHERE external_id = '${external_id}'
        AND workspace_id = '${workspace_id}'
      `,
    });
  }
};
