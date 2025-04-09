import { EditableLink } from "@/components/editable/editable-link";
import { FieldCard } from "@/components/editable/field-card";
import { trpc } from "@/server/client";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Separator } from "@conquest/ui/separator";
import { DiscourseDetailsSchema } from "@conquest/zod/schemas/integration.schema";
import { DiscourseProfile } from "@conquest/zod/schemas/profile.schema";
import { MenuProfile } from "./menu-profile";

type Props = {
  profile: DiscourseProfile;
};

export const DiscourseSection = ({ profile }: Props) => {
  const source = "Discourse";
  const { data: discourse } = trpc.integrations.bySource.useQuery({ source });

  const details = discourse
    ? DiscourseDetailsSchema.parse(discourse?.details)
    : null;

  const { community_url, user_fields } = details ?? {};
  const { username, custom_fields } = profile.attributes;

  return (
    <>
      <div className="flex flex-col gap-2 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Discourse size={16} /> <p>Discourse</p>
          </div>
          <MenuProfile profile={profile} />
        </div>
        <FieldCard label="Username">
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
            <FieldCard key={id} label={key}>
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
