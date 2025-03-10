import {
  type ProfileAttributes,
  ProfileSchema,
} from "@conquest/zod/schemas/profile.schema";
import { v4 as uuid } from "uuid";
import { client } from "../client";

type Props = {
  external_id?: string | null;
  attributes: ProfileAttributes;
  member_id: string;
  created_at?: Date;
  workspace_id: string;
};

export const createProfile = async ({
  external_id,
  attributes,
  member_id,
  created_at,
  workspace_id,
}: Props) => {
  const id = uuid();

  await client.insert({
    table: "profile",
    values: [
      {
        id,
        external_id,
        attributes,
        member_id,
        created_at,
        workspace_id,
      },
    ],
    format: "JSON",
  });

  const result = await client.query({
    query: `
      SELECT *
      FROM profile
      WHERE id = '${id}'
    `,
  });

  const { data } = await result.json();
  return ProfileSchema.parse(data[0]);
};
