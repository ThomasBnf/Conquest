import {
  type Channel,
  ChannelSchema,
} from "@conquest/zod/schemas/channel.schema";
import { v4 as uuid } from "uuid";
import { client } from "../client";

type Props = Partial<Channel>;

export const createChannel = async (props: Props) => {
  const id = uuid();

  await client.insert({
    table: "channels",
    values: [
      {
        id,
        ...props,
      },
    ],
    format: "JSON",
  });

  const result = await client.query({
    query: `
      SELECT * 
      FROM channels 
      WHERE id = '${id}'`,
  });

  const { data } = await result.json();
  return ChannelSchema.parse(data[0]);
};
