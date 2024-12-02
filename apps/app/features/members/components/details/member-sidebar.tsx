"use client";

import { EditableCompany } from "@/components/custom/editable-company";
import { EditableEmails } from "@/components/custom/editable-emails";
import { EditableInput } from "@/components/custom/editable-input";
import { EditablePhones } from "@/components/custom/editable-phones";
import { FieldCard } from "@/components/custom/field-card";
import { _updateMember } from "@/features/members/actions/_updateMember";
import { TagPicker } from "@/features/tags/tag-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Badge } from "@conquest/ui/badge";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { format } from "date-fns";
import { Gauge, Heart } from "lucide-react";

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
    localisation,
    created_at,
    joined_at,
  } = member;

  const onUpdateMember = async (
    field:
      | "first_name"
      | "last_name"
      | "company_id"
      | "phone"
      | "job_title"
      | "address"
      | "bio"
      | "source",
    value: string | null,
  ) => {
    await _updateMember({ id, [field]: value });
  };

  return (
    <div className="flex h-full max-w-md flex-1 flex-col">
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Avatar className="size-12">
            <AvatarImage src={avatar_url ?? ""} />
            <AvatarFallback className="text-sm">
              {first_name?.charAt(0).toUpperCase()}
              {last_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-base leading-tight">{full_name}</p>
            <p className="text-muted-foreground text-xs">{id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-2 text-sm">
            <Gauge size={15} className="text-main-500" />
            {member.level}
          </Badge>
          <Badge variant="outline" className="gap-2 text-sm">
            <Heart size={14} className="fill-red-500 text-red-500" />
            {member.love}
          </Badge>
        </div>
      </div>
      <Separator />
      <div className="space-y-2 p-4">
        <FieldCard icon="Code" label="Source">
          <p className="pl-1.5">{source}</p>
        </FieldCard>
        <FieldCard icon="Flag" label="Localisation">
          <p className="pl-1.5">{localisation}</p>
        </FieldCard>
        <FieldCard icon="Tag" label="Tags">
          <TagPicker record={member} tags={tags} />
        </FieldCard>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          <p className="mb-4 text-muted-foreground text-xs">MEMBER DETAILS</p>
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
          <FieldCard icon="Building2" label="Company">
            <EditableCompany
              defaultValue={member.company_id}
              onUpdate={(value) => onUpdateMember("company_id", value)}
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
        <div className="space-y-2 p-4">
          {joined_at && (
            <FieldCard icon="CalendarCheck" label="Joined at">
              <p className="pl-1.5">{format(joined_at, "PPP p")}</p>
            </FieldCard>
          )}
          <FieldCard icon="CalendarPlus" label="Created at">
            <p className="pl-1.5">{format(created_at, "PPP p")}</p>
          </FieldCard>
        </div>
      </ScrollArea>
    </div>
  );
};
