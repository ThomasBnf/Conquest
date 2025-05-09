import { FieldCard } from "@/components/editable/field-card";
import { trpc } from "@/server/client";
import { Label } from "@conquest/ui/label";
import { Separator } from "@conquest/ui/separator";
import { DiscourseDetailsSchema } from "@conquest/zod/schemas/integration.schema";
import {
  DiscourseProfile,
  Profile,
} from "@conquest/zod/schemas/profile.schema";

type Props = {
  profiles: Profile[] | undefined;
};

export const DiscourseFields = ({ profiles }: Props) => {
  const discourseProfile = profiles?.find(
    (profile) => profile.attributes.source === "Discourse",
  ) as DiscourseProfile;

  if (!discourseProfile) return null;

  const source = "Discourse";
  const { data: discourse } = trpc.integrations.bySource.useQuery({ source });

  const details = discourse
    ? DiscourseDetailsSchema.parse(discourse?.details)
    : null;

  const { userFields } = details ?? {};
  const { customFields } = discourseProfile.attributes;

  return (
    <>
      <div className="space-y-4 p-4">
        <Label className="text-base">Discourse custom fields</Label>
        <div className="space-y-2">
          {customFields?.map((userField) => {
            const { id, value } = userField;
            const key = userFields?.find((field) => field.id === id)?.name;

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
      </div>
      <Separator />
    </>
  );
};
