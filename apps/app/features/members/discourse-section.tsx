import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Discourse } from "@/components/icons/Discourse";
import { trpc } from "@/server/client";
import { DiscourseDetailsSchema } from "@conquest/zod/schemas/integration.schema";
import type { Profile } from "@conquest/zod/schemas/profile.schema";
import { DiscourseProfileSchema } from "@conquest/zod/schemas/profile.schema";

type Props = {
  profiles: Profile[] | undefined;
};

export const DiscourseSection = ({ profiles }: Props) => {
  const profile = profiles?.find(
    (profile) => profile.attributes.source === "Discourse",
  );

  if (!profile) return null;

  const source = "Discourse";
  const { data: discourse } = trpc.integrations.bySource.useQuery({ source });
  const details = DiscourseDetailsSchema.parse(discourse?.details);
  const { user_fields } = details;

  const discourseProfile = DiscourseProfileSchema.parse(profile);
  const { attributes } = discourseProfile;
  const { username, custom_fields } = attributes;

  return (
    <>
      <FieldCard icon={<Discourse size={14} />} label="Discourse">
        <EditableLink
          placeholder="No discourse profile"
          defaultValue={username}
          href={`https://playground.lagrowthmachine.com/u/${username}/summary`}
          editable={false}
        />
      </FieldCard>
      {custom_fields?.map((user_field) => {
        const { id, value } = user_field;
        const key = user_fields?.find((field) => field.id === id)?.name;

        if (!key) return null;

        return (
          <FieldCard key={id} icon="User" label={key}>
            <p className="place-content-center truncate px-2">{value}</p>
          </FieldCard>
        );
      })}
    </>
  );
};
