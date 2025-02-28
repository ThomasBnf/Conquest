import {
  type ProfileAttributes,
  ProfileSchema,
} from "@conquest/zod/schemas/profile.schema";
import { client } from "../client";
import { createProfile } from "./createProfile";
import { updateProfile } from "./updateProfile";

type Props = {
  external_id: string;
  attributes: ProfileAttributes;
  member_id: string;
  workspace_id: string;
};

export const upsertProfile = async ({
  external_id,
  attributes,
  member_id,
  workspace_id,
}: Props) => {
  const result = await client.query({
    query: `
      SELECT *
      FROM profiles
      WHERE external_id = '${external_id}' 
      AND workspace_id = '${workspace_id}'
    `,
    format: "JSON",
  });

  const { data } = await result.json();
  const existingProfile = data.length > 0;
  const profile = existingProfile ? ProfileSchema.parse(data[0]) : null;

  if (profile) {
    console.log("profile", profile);
    await updateProfile({ id: profile.id, attributes });
  } else {
    return await createProfile({
      external_id,
      attributes,
      member_id,
      workspace_id,
    });
  }

  return profile;
};
