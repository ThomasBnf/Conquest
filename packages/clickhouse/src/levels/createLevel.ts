import { client } from "../client";

type Props = {
  name: string;
  number: number;
  from: number;
  to?: number;
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
    table: "levels",
    values: {
      name,
      number,
      from,
      to,
      workspace_id,
    },
    format: "JSONEachRow",
  });
};
