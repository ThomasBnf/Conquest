"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { Separator } from "@conquest/ui/separator";
import type { Member } from "@conquest/zod/member.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { updateMember } from "actions/members/updateMember";
import { AddressInput } from "components/custom/address-input";
import { EditableInput } from "components/custom/editable-input";
import { Code } from "lucide-react";
import { TagPicker } from "../tags/tag-picker";
import { EditableEmails } from "./editable-emails";

type Props = {
  member: Member | undefined;
  tags: Tag[] | undefined;
};

export const MemberSidebar = ({ member, tags }: Props) => {
  if (!member) return;

  const { id, avatar_url, first_name, last_name, full_name } = member;

  const onUpdateMember = async (
    field: "phone" | "job_title" | "bio" | "source",
    value: string,
  ) => {
    await updateMember({ id, [field]: value });
  };

  return (
    <div className="w-full max-w-sm shrink-0">
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
      <div className="p-4">
        <p className="mb-2 font-medium">Informations</p>
        <div className="flex flex-col gap-1.5">
          <EditableEmails member={member} />
          <EditableInput
            icon="Phone"
            defaultValue={member.phone}
            placeholder="Set phone"
            onUpdate={(value) => onUpdateMember("phone", value)}
          />
          <EditableInput
            icon="Briefcase"
            defaultValue={member.job_title}
            placeholder="Set job title"
            onUpdate={(value) => onUpdateMember("job_title", value)}
          />
          <EditableInput
            icon="Pen"
            textArea
            defaultValue={member.bio}
            placeholder="Set bio"
            onUpdate={(value) => onUpdateMember("bio", value)}
          />
        </div>
      </div>
      <Separator />
      <div className="p-4">
        <p className="mb-2 font-medium">Location</p>
        <AddressInput member={member} />
      </div>
      <Separator />
      <div className="p-4">
        <p className="mb-2 font-medium">Tags</p>
        <div className="flex flex-wrap items-center gap-2">
          <TagPicker member={member} tags={tags} />
        </div>
      </div>
      <Separator />
      <div className="p-4">
        <p className="mb-2 font-medium">Source</p>
        <div className="flex items-center gap-3">
          <Code size={15} className="text-muted-foreground" />
          <p>{member.source}</p>
        </div>
      </div>
      <Separator />
    </div>
  );
};
