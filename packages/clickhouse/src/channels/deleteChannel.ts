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
  if ("id" in props) {
    return await client.query({
      query: `
        DELETE 
        FROM channels 
        WHERE id = '${props.id}'`,
    });
  }

  return await client.query({
    query: `
      DELETE 
      FROM channels 
      WHERE external_id = '${props.external_id}'
      AND workspace_id = '${props.workspace_id}'`,
  });
};
