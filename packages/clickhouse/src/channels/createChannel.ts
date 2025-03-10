import type { Source } from "@conquest/zod/enum/source.enum";
import { v4 as uuid } from "uuid";
import { client } from "../client";
import { getChannel } from "./getChannel";
type Props = {
  external_id: string;
  name: string;
  source: Source;
  workspace_id: string;
};

export const createChannel = async ({
  external_id,
  name,
  source,
  workspace_id,
}: Props) => {
  const id = uuid();

  await client.insert({
    table: "channel",
    values: [
      {
        id,
        external_id,
        name,
        source,
        workspace_id,
      },
    ],
    format: "JSON",
  });

  return getChannel({ id });
};
