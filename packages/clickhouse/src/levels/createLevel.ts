import { client } from "../client";

type Props = {
  name: string;
  number: number;
  from: number;
  to?: number | null;
  workspaceId: string;
};

export const createLevel = async ({
  name,
  number,
  from,
  to,
  workspaceId,
}: Props) => {
  await client.insert({
    table: "level",
    values: {
      name,
      number,
      from,
      to,
      workspaceId,
    },
    format: "JSON",
  });
};
