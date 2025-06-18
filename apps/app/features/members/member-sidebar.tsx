"use client";

import { SourceBadge } from "@/components/badges/source-badge";
import { EditableCompany } from "@/components/editable/editable-company";
import { EditableCountry } from "@/components/editable/editable-country";
import { EditableEmails } from "@/components/editable/editable-emails";
import { EditableInput } from "@/components/editable/editable-input";
import { EditableLanguage } from "@/components/editable/editable-language";
import { EditableLink } from "@/components/editable/editable-link";
import { EditablePhones } from "@/components/editable/editable-phones";
import { FieldCard } from "@/components/editable/field-card";
import { TagPicker } from "@/features/tags/tag-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Badge } from "@conquest/ui/badge";
import { cn } from "@conquest/ui/cn";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Profile } from "@conquest/zod/schemas/profile.schema";
import { format } from "date-fns";
import { AddCustomField } from "../custom-fields/add-custom-field";
import { CustomFieldsParser } from "../custom-fields/custom-fields-parser";
import { DiscourseFields } from "./DiscourseFields";
import { GithubFields } from "./GithubFields.tsx";
import { ProfilesParser } from "./ProfilesParser";
import { LevelBadge } from "./level-badge";
import { useUpdateMember } from "./mutations/useUpdateMember";
import { PulseBadge } from "./pulse-badge";

type Props = {
  member: Member;
  profiles: Profile[] | undefined;
};

export const MemberSidebar = ({ member, profiles }: Props) => {
  const {
    id,
    firstName,
    lastName,
    jobTitle,
    avatarUrl,
    country,
    language,
    source,
    linkedinUrl,
    firstActivity,
    lastActivity,
    createdAt,
    isStaff,
  } = member ?? {};

  const updateMember = useUpdateMember();

  const onUpdateMember = async (
    field: keyof Member,
    value: string | string[] | Date | null,
  ) => {
    if (member[field] === value) return;
    updateMember({ ...member, [field]: value });
  };

  return (
    <div className="flex h-full w-full max-w-96 shrink-0 flex-col overflow-hidden bg-sidebar">
      <ScrollArea>
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <Avatar className="size-9">
              <AvatarImage src={avatarUrl ?? ""} />
              <AvatarFallback>
                {firstName?.charAt(0).toUpperCase()}
                {lastName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <p className="font-medium text-base leading-tight">
                {firstName} {lastName}
              </p>
              <p className="text-muted-foreground">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isStaff && <Badge>Staff</Badge>}
            <LevelBadge member={member} />
            <PulseBadge member={member} showIcon={false} />
          </div>
        </div>
        <Separator />
        <div className="space-y-4 p-4">
          <FieldCard label="Tags">
            <TagPicker
              variant="ghost"
              tags={member.tags}
              onUpdate={(value) => onUpdateMember("tags", value)}
              className={cn(
                "text-muted-foreground",
                member.tags.length > 0 ? "min-h-8" : "-ml-[7px]",
              )}
            />
          </FieldCard>
        </div>
        <Separator />
        <ProfilesParser profiles={profiles} />
        <div className="space-y-4 p-4">
          <FieldCard label="First name">
            <EditableInput
              defaultValue={firstName}
              placeholder="Set first name"
              onUpdate={(value) => onUpdateMember("firstName", value)}
            />
          </FieldCard>
          <FieldCard label="Last name">
            <EditableInput
              defaultValue={lastName}
              placeholder="Set last name"
              onUpdate={(value) => onUpdateMember("lastName", value)}
            />
          </FieldCard>
          <FieldCard label="Company">
            <EditableCompany
              member={member}
              onUpdate={(value) => onUpdateMember("companyId", value)}
            />
          </FieldCard>
          <FieldCard label="Job title">
            <EditableInput
              defaultValue={jobTitle}
              placeholder="Set job title"
              onUpdate={(value) => onUpdateMember("jobTitle", value)}
            />
          </FieldCard>
          <FieldCard label="Emails" className="items-start">
            <EditableEmails
              member={member}
              onUpdate={(field, value) => onUpdateMember(field, value)}
            />
          </FieldCard>
          <FieldCard label="Phones">
            <EditablePhones
              member={member}
              onUpdate={(field, value) => onUpdateMember(field, value)}
            />
          </FieldCard>
          <FieldCard label="LinkedIn">
            <EditableLink
              defaultValue={linkedinUrl}
              placeholder="Set linkedIn URL"
              onUpdate={(value) => onUpdateMember("linkedinUrl", value)}
              href={linkedinUrl}
            />
          </FieldCard>
          <CustomFieldsParser record="MEMBER" member={member} />
          <AddCustomField record="MEMBER" />
        </div>
        <Separator />
        <div className="space-y-4 p-4">
          <FieldCard label="Language">
            <EditableLanguage
              language={language}
              onUpdate={(value) => onUpdateMember("language", value)}
            />
          </FieldCard>
          <FieldCard label="Country">
            <EditableCountry
              country={country}
              onUpdate={(value) => onUpdateMember("country", value)}
            />
          </FieldCard>
          <FieldCard label="Source">
            <SourceBadge source={source} />
          </FieldCard>
        </div>
        <Separator />
        <DiscourseFields profiles={profiles} />
        <GithubFields profiles={profiles} />
        <div className="space-y-4 p-4 pb-32">
          {firstActivity && (
            <FieldCard label="First activity">
              <p className="h-8 place-content-center">
                {format(firstActivity, "PPp")}
              </p>
            </FieldCard>
          )}
          {lastActivity && (
            <FieldCard label="Last activity">
              <p className="h-8 place-content-center">
                {format(lastActivity, "PPp")}
              </p>
            </FieldCard>
          )}
          <FieldCard label="Created at">
            <p className="h-8 place-content-center">
              {format(createdAt, "PPp")}
            </p>
          </FieldCard>
        </div>
      </ScrollArea>
    </div>
  );
};
