import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { Discourse } from "@/components/icons/Discourse";
import type { Profile } from "@conquest/zod/schemas/profile.schema";
import { DiscourseProfileSchema } from "@conquest/zod/schemas/profile.schema";

type Props = {
  profiles: Profile[] | undefined;
};

export const DiscourseSection = ({ profiles }: Props) => {
  const profile = profiles?.find(
    (profile) => profile.attributes.source === "DISCOURSE",
  );

  if (!profile) return null;

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
        const field = custom_fields.find((field) => field.id === id);

        return (
          <FieldCard key={id} icon="User" label={value}>
            <p className="py-1.5">{field?.value}</p>
          </FieldCard>
        );
      })}
    </>
  );
};
