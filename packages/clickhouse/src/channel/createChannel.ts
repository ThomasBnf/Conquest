import type { Source } from "@conquest/zod/enum/source.enum";
import { v4 as uuid } from "uuid";
import { client } from "../client";
import { getChannel } from "./getChannel";

type Props = {
  externalId: string;
  name: string;
  source: Source;
  workspaceId: string;
};

export const createChannel = async ({
  externalId,
  name,
  source,
  workspaceId,
}: Props) => {
  const id = uuid();

  await client.insert({
    table: "channel",
    values: [
      {
        id,
        externalId,
        name,
        source,
        workspaceId,
      },
    ],
    format: "JSON",
  });

  return getChannel({ id });
};
