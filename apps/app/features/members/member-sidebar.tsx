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
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { Member } from "@conquest/zod/schemas/member.schema";
import type { Profile } from "@conquest/zod/schemas/profile.schema";
import { format } from "date-fns";
import { TagIcon } from "lucide-react";
import { LevelBadge } from "./level-badge";
import { ProfilesParser } from "./profiles-parser";
import { PulseBadge } from "./pulse-badge";

type Props = {
  member: Member;
  profiles: Profile[] | undefined;
};

export const MemberSidebar = ({ member, profiles }: Props) => {
  const {
    id,
    first_name,
    last_name,
    job_title,
    avatar_url,
    country,
    language,
    source,
    linkedin_url,
    first_activity,
    last_activity,
    created_at,
  } = member ?? {};
  const utils = trpc.useUtils();

  const { mutateAsync: updateMember } = trpc.members.update.useMutation({
    onMutate: (updatedMember) => {
      const { id } = updatedMember;

      utils.members.get.cancel({ id });
      const previousMember = utils.members.get.getData({ id });

      utils.members.get.setData({ id }, updatedMember);

      return { previousMember };
    },
    onError: (_, __, context) => {
      utils.members.get.setData({ id }, context?.previousMember);
    },
    onSettled: () => {
      utils.members.get.invalidate({ id });
    },
  });

  const onUpdateMember = async (
    field: keyof Member,
    value: string | null | string[],
  ) => {
    if (member[field] === value) return;
    await updateMember({ ...member, [field]: value });
  };

  return (
    <div className="flex h-full w-full max-w-96 shrink-0 flex-col overflow-hidden bg-sidebar">
      <ScrollArea>
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <Avatar className="size-9">
              <AvatarImage src={avatar_url ?? ""} />
              <AvatarFallback className="text-sm">
                {first_name?.charAt(0).toUpperCase()}
                {last_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <p className="font-medium text-base leading-tight">
                {first_name} {last_name}
              </p>
              <p className="text-muted-foreground">{id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LevelBadge member={member} />
            <PulseBadge member={member} showIcon={false} />
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TagIcon size={16} className="shrink-0" />
            <p>Tags</p>
          </div>
          <TagPicker
            record={member}
            onUpdate={(value) => onUpdateMember("tags", value)}
          />
        </div>
        <Separator />
        <ProfilesParser profiles={profiles} />
        <div className="space-y-4 p-4">
          <FieldCard label="First name">
            <EditableInput
              defaultValue={first_name}
              placeholder="Set first name"
              onUpdate={(value) => onUpdateMember("first_name", value)}
            />
          </FieldCard>
          <FieldCard label="Last name">
            <EditableInput
              defaultValue={last_name}
              placeholder="Set last name"
              onUpdate={(value) => onUpdateMember("last_name", value)}
            />
          </FieldCard>
          <FieldCard label="Company">
            <EditableCompany
              member={member}
              onUpdate={(value) => onUpdateMember("company_id", value)}
            />
          </FieldCard>
          <FieldCard label="Job title">
            <EditableInput
              defaultValue={job_title}
              placeholder="Set job title"
              onUpdate={(value) => onUpdateMember("job_title", value)}
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
              defaultValue={linkedin_url}
              placeholder="Set linkedIn URL"
              onUpdate={(value) => onUpdateMember("linkedin_url", value)}
              href={linkedin_url}
            />
          </FieldCard>
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
            <SourceBadge source={source} className="ml-2" />
          </FieldCard>
        </div>
        <Separator />
        <div className="space-y-4 p-4">
          {first_activity && (
            <FieldCard label="First activity">
              <p className="h-8 place-content-center pl-2">
                {format(first_activity, "PPp")}
              </p>
            </FieldCard>
          )}
          {last_activity && (
            <FieldCard label="Last activity">
              <p className="h-8 place-content-center pl-2">
                {format(last_activity, "PPp")}
              </p>
            </FieldCard>
          )}
          <FieldCard label="Created at">
            <p className="h-8 place-content-center pl-2">
              {format(created_at, "PPp")}
            </p>
          </FieldCard>
        </div>
      </ScrollArea>
    </div>
  );
};
