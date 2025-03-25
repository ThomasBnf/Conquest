import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { trpc } from "@/server/client";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Separator } from "@conquest/ui/separator";
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
  const details = discourse
    ? DiscourseDetailsSchema.parse(discourse?.details)
    : null;
  const { community_url, user_fields } = details ?? {};

  const discourseProfile = DiscourseProfileSchema.parse(profile);
  const { attributes } = discourseProfile;
  const { username, custom_fields } = attributes;

  return (
    <>
      <div className="space-y-2 p-4">
        <FieldCard icon={<Discourse size={14} />} label="Discourse">
          <EditableLink
            placeholder="No discourse profile"
            defaultValue={username}
            href={`${community_url}/u/${username}/summary`}
            editable={false}
          />
        </FieldCard>
        {custom_fields?.map((user_field) => {
          const { id, value } = user_field;
          const key = user_fields?.find((field) => field.id === id)?.name;

          if (!key) return null;

          return (
            <FieldCard key={id} icon="User" label={key}>
              <p className="h-full place-content-center truncate px-2">
                {value}
              </p>
            </FieldCard>
          );
        })}
      </div>
      <Separator />
    </>
  );
};
