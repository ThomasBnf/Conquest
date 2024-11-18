"use client";

import { EditableEmails } from "@/components/custom/editable-emails";
import { EditableInput } from "@/components/custom/editable-input";
import { EditablePhones } from "@/components/custom/editable-phones";
import { FieldCard } from "@/components/custom/field-card";
import { _updateMember } from "@/features/members/actions/_updateMember";
import { TagPicker } from "@/features/tags/tag-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { format } from "date-fns";

type Props = {
  member: MemberWithActivities;
  tags: Tag[] | undefined;
};

export const MemberSidebar = ({ member, tags }: Props) => {
  const {
    id,
    source,
    job_title,
    avatar_url,
    first_name,
    last_name,
    full_name,
    locale,
    created_at,
    joined_at,
  } = member;

  const onUpdateMember = async (
    field:
      | "first_name"
      | "last_name"
      | "phone"
      | "job_title"
      | "address"
      | "bio"
      | "source",
    value: string,
  ) => {
    await _updateMember({ id, [field]: value });
  };

  return (
    <div className="flex flex-col h-full flex-1 max-w-md">
      <div className="flex items-center gap-2 p-4">
        <Avatar className="size-12">
          <AvatarImage src={avatar_url ?? ""} />
          <AvatarFallback className="text-sm">
            {first_name?.charAt(0).toUpperCase()}
            {last_name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-base font-medium leading-tight">{full_name}</p>
          <p className="text-xs text-muted-foreground">{id}</p>
        </div>
      </div>
      <Separator />
      <div className="p-4 space-y-2">
        <FieldCard icon="Code" label="Source">
          <p className="pl-1.5">{source}</p>
        </FieldCard>
        <FieldCard icon="Flag" label="Localisation">
          <p className="pl-1.5">{locale}</p>
        </FieldCard>
        <FieldCard icon="Tag" label="Tags">
          <TagPicker record={member} tags={tags} />
        </FieldCard>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground">MEMBER DETAILS</p>
          <FieldCard icon="User" label="First name">
            <EditableInput
              defaultValue={first_name}
              placeholder="Set first name"
              onUpdate={(value) => onUpdateMember("first_name", value)}
            />
          </FieldCard>
          <FieldCard icon="User" label="Last name">
            <EditableInput
              defaultValue={last_name}
              placeholder="Set last name"
              onUpdate={(value) => onUpdateMember("last_name", value)}
            />
          </FieldCard>
          <FieldCard icon="Briefcase" label="Job title">
            <EditableInput
              defaultValue={job_title}
              placeholder="Set job title"
              onUpdate={(value) => onUpdateMember("job_title", value)}
            />
          </FieldCard>
          <FieldCard icon="Mail" label="Emails">
            <EditableEmails member={member} />
          </FieldCard>
          <FieldCard icon="Phone" label="Phone">
            <EditablePhones member={member} />
          </FieldCard>
          <FieldCard icon="AlignLeft" label="Bio">
            <EditableInput
              textArea
              defaultValue={member.bio}
              placeholder="Set bio"
              onUpdate={(value) => onUpdateMember("bio", value)}
            />
          </FieldCard>
        </div>
        <Separator />
        <div className="p-4 space-y-2">
          {joined_at && (
            <FieldCard icon="CalendarCheck" label="Joined at">
              <p className="pl-1.5">{format(joined_at, "PP p")}</p>
            </FieldCard>
          )}
          <FieldCard icon="CalendarPlus" label="Created at">
            <p className="pl-1.5">{format(created_at, "PP p")}</p>
          </FieldCard>
        </div>
      </ScrollArea>
    </div>
  );
};
