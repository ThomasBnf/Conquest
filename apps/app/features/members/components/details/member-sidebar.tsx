"use client";

import { updateMember } from "@/actions/members/updateMember";
import { EditableCompany } from "@/components/custom/editable-company";
import { EditableEmails } from "@/components/custom/editable-emails";
import { EditableInput } from "@/components/custom/editable-input";
import { EditablePhones } from "@/components/custom/editable-phones";
import { FieldCard } from "@/components/custom/field-card";
import { LocaleBadge } from "@/components/custom/locale-badge";
import { SourceBadge } from "@/components/custom/source-badge";
import { TagPicker } from "@/features/tags/tag-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Badge } from "@conquest/ui/badge";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { format } from "date-fns";
import { LevelTooltip } from "../level-tooltip";
import { LoveTooltip } from "../love-tooltip";

type Props = {
  member: MemberWithCompany;
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
    locale,
    first_activity,
    last_activity,
    joined_at,
    created_at,
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
      | "source"
      | "tags",
    value: string | null | string[],
  ) => {
    await updateMember({ id, [field]: value });
  };

  return (
    <div className="flex h-full max-w-sm flex-1 shrink-0 flex-col">
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Avatar className="size-9">
            <AvatarImage src={avatar_url ?? ""} />
            <AvatarFallback className="text-sm">
              {first_name?.charAt(0).toUpperCase()}
              {last_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="font-medium text-base leading-tight">
            {first_name} {last_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <LevelTooltip member={member} showIcon={false} />
          </Badge>
          <Badge variant="outline">
            <LoveTooltip member={member} showIcon={false} />
          </Badge>
        </div>
      </div>
      <Separator />
      <div className="space-y-2 p-4">
        <FieldCard icon="Tag" label="Tags">
          <TagPicker
            record={member}
            tags={tags}
            onUpdate={(value) => onUpdateMember("tags", value)}
          />
        </FieldCard>
      </div>
      <ScrollArea className="flex-1">
        <Separator />
        <div className="space-y-2 p-4">
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
              member={member}
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
          <FieldCard icon="Code" label="Source">
            <SourceBadge source={source} />
          </FieldCard>
          <FieldCard icon="Flag" label="Locale">
            <LocaleBadge country={locale} />
          </FieldCard>
        </div>
        <Separator />
        <div className="space-y-2 p-4">
          {first_activity && (
            <FieldCard icon="Calendar" label="First activity">
              <p className="pl-1.5">{format(first_activity, "PP, HH'h'mm")}</p>
            </FieldCard>
          )}
          {last_activity && (
            <FieldCard icon="CalendarSearch" label="Last activity">
              <p className="pl-1.5">{format(last_activity, "PP, HH'h'mm")}</p>
            </FieldCard>
          )}
          {joined_at && (
            <FieldCard icon="CalendarCheck" label="Joined at">
              <p className="pl-1.5">{format(joined_at, "PP, HH'h'mm")}</p>
            </FieldCard>
          )}
          <FieldCard icon="CalendarPlus" label="Created at">
            <p className="pl-1.5">{format(created_at, "PP, HH'h'mm")}</p>
          </FieldCard>
        </div>
      </ScrollArea>
    </div>
  );
};
