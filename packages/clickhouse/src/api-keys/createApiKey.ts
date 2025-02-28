import type { APIKey } from "@conquest/zod/schemas/apikey.schema";
import { client } from "../client";

type Props = Partial<APIKey>;

export const createApiKey = async (props: Props) => {
  await client.insert({
    table: "api_keys",
    values: props,
    format: "JSON",
  });
};
