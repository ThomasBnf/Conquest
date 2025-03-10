import { client } from "../client";

type Props = {
  name: string;
  number: number;
  from: number;
  to?: number | null;
  workspace_id: string;
};

export const createLevel = async ({
  name,
  number,
  from,
  to,
  workspace_id,
}: Props) => {
  await client.insert({
    table: "level",
    values: {
      name,
      number,
      from,
      to,
      workspace_id,
    },
    format: "JSON",
  });
};
