import {
  type ProfileAttributes,
  ProfileSchema,
} from "@conquest/zod/schemas/profile.schema";
import { v4 as uuid } from "uuid";
import { client } from "../client";

type Props = {
  external_id: string;
  attributes: ProfileAttributes;
  member_id: string;
  workspace_id: string;
};

export const createProfile = async ({
  external_id,
  attributes,
  member_id,
  workspace_id,
}: Props) => {
  const id = uuid();

  await client.insert({
    table: "profiles",
    values: [
      {
        id,
        external_id,
        attributes,
        member_id,
        workspace_id,
      },
    ],
    format: "JSON",
  });

  const result = await client.query({
    query: `
      SELECT *
      FROM profiles
      WHERE id = '${id}'
    `,
  });

  const { data } = await result.json();
  return ProfileSchema.parse(data[0]);
};
