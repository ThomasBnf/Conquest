"use client";

import { updateMember } from "@/actions/members/updateMember";
import { EditableCompany } from "@/components/custom/editable-company";
import { EditableEmails } from "@/components/custom/editable-emails";
import { EditableInput } from "@/components/custom/editable-input";
import { EditableLink } from "@/components/custom/editable-link";
import { EditableLocale } from "@/components/custom/editable-locale";
import { EditablePhones } from "@/components/custom/editable-phones";
import { FieldCard } from "@/components/custom/field-card";
import { SourceBadge } from "@/components/custom/source-badge";
import { Discourse } from "@/components/icons/Discourse";
import { Linkedin } from "@/components/icons/Linkedin";
import { Slack } from "@/components/icons/Slack";
import { useUser } from "@/context/userContext";
import { TagPicker } from "@/features/tags/tag-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Badge } from "@conquest/ui/badge";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { MemberWithCompany } from "@conquest/zod/schemas/member.schema";
import type { Tag } from "@conquest/zod/schemas/tag.schema";
import { format } from "date-fns";
import { TagIcon } from "lucide-react";
import { LevelTooltip } from "../members/level-tooltip";
import { PulseTooltip } from "../members/pulse-tooltip";

type Props = {
  member: MemberWithCompany;
  tags: Tag[] | undefined;
};

export const MemberSidebar = ({ member, tags }: Props) => {
  const { slack, discourse } = useUser();
  const { user_fields } = discourse?.details ?? {};
  const { url } = slack?.details ?? {};

  const {
    id,
    slack_id,
    source,
    job_title,
    avatar_url,
    first_name,
    last_name,
    username,
    locale,
    linkedin_url,
    first_activity,
    last_activity,
    created_at,
  } = member;

  const onUpdateMember = async (
    field:
      | "first_name"
      | "last_name"
      | "username"
      | "linkedin_url"
      | "company_id"
      | "job_title"
      | "locale"
      | "source"
      | "tags",
    value: string | null | string[],
  ) => {
    await updateMember({ id, [field]: value });
  };

  return (
    <div className="flex h-full max-w-sm flex-1 shrink-0 flex-col">
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <Avatar className="size-9">
              <AvatarImage src={avatar_url ?? ""} />
              <AvatarFallback className="text-sm">
                {first_name?.charAt(0).toUpperCase()}
                {last_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-base leading-tight">
                {first_name} {last_name}
              </p>
              <p className="text-muted-foreground">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <LevelTooltip member={member} showIcon={false} />
            </Badge>
            <Badge variant="secondary">
              <PulseTooltip member={member} showIcon={false} />
            </Badge>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TagIcon size={15} className="shrink-0" />
            <p>Tags</p>
          </div>
          <TagPicker
            record={member}
            tags={tags}
            onUpdate={(value) => onUpdateMember("tags", value)}
          />
        </div>
        <Separator />
        <div className="space-y-2 p-4">
          <FieldCard icon={<Linkedin size={16} />} label="Linkedin">
            <EditableLink
              defaultValue={linkedin_url}
              placeholder="Set linkedin url"
              onUpdate={(value) => onUpdateMember("linkedin_url", value)}
            />
          </FieldCard>
          {slack && (
            <FieldCard icon={<Slack size={14} />} label="Slack">
              <EditableLink
                defaultValue={`${url}/team/${slack_id}`}
                editable={false}
              />
            </FieldCard>
          )}
          {discourse && (
            <FieldCard icon={<Discourse size={14} />} label="Discourse">
              <EditableLink
                defaultValue={`https://playground.lagrowthmachine.com/u/${username}/summary`}
                editable={false}
              />
            </FieldCard>
          )}
        </div>
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
          <FieldCard icon="User" label="Username">
            <EditableInput
              defaultValue={username}
              placeholder="Set username"
              onUpdate={(value) => onUpdateMember("username", value)}
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
        </div>
        <Separator />
        <div className="space-y-2 p-4">
          <FieldCard icon="Code" label="Source">
            <SourceBadge source={source} className="ml-1 self-center" />
          </FieldCard>
          <FieldCard icon="Flag" label="Locale">
            <EditableLocale
              locale={locale}
              onUpdate={(value) => onUpdateMember("locale", value)}
            />
          </FieldCard>
        </div>
        <Separator />
        {discourse && (
          <>
            <div className="space-y-2 p-4">
              {user_fields?.map((user_field) => {
                const { id, name } = user_field;
                const field = member.custom_fields.find(
                  (field) => field.id === id,
                );
                return (
                  <FieldCard key={id} icon="User" label={name}>
                    <p className="py-1.5">{field?.value}</p>
                  </FieldCard>
                );
              })}
            </div>
            <Separator />
          </>
        )}
        <div className="space-y-2 p-4">
          {first_activity && (
            <FieldCard icon="Calendar" label="First activity">
              <p className="h-8 place-content-center pl-1">
                {format(first_activity, "PP, HH'h'mm")}
              </p>
            </FieldCard>
          )}
          {last_activity && (
            <FieldCard icon="CalendarSearch" label="Last activity">
              <p className="h-8 place-content-center pl-1">
                {format(last_activity, "PP, HH'h'mm")}
              </p>
            </FieldCard>
          )}
          <FieldCard icon="CalendarPlus" label="Created at">
            <p className="h-8 place-content-center pl-1">
              {format(created_at, "PP, HH'h'mm")}
            </p>
          </FieldCard>
        </div>
      </ScrollArea>
    </div>
  );
};
