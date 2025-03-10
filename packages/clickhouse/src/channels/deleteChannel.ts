import { client } from "../client";

type Props =
  | {
      id: string;
    }
  | {
      external_id: string;
      workspace_id: string;
    };

export const deleteChannel = async (props: Props) => {
  if ("external_id" in props) {
    const { external_id, workspace_id } = props;

    await client.query({
      query: `
        ALTER TABLE channel
        DELETE WHERE external_id = '${external_id}' 
        AND workspace_id = '${workspace_id}'
      `,
    });
  }

  if ("id" in props) {
    const { id } = props;

    await client.query({
      query: `
        ALTER TABLE channel
        DELETE WHERE id = '${id}'
      `,
    });
  }
};
