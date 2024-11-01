"use client";

import { AddressInput } from "@/components/custom/address-input";
import { EditableInput } from "@/components/custom/editable-input";
import { _updateMember } from "@/features/members/actions/_updateMember";
import { TagPicker } from "@/features/tags/tag-picker";
import type { MemberWithActivities } from "@conquest/zod/activity.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { EditableEmails } from "./editable-emails";
import { EditablePhones } from "./editable-phones";
import { FieldCard } from "./field-card";

type Props = {
  member: MemberWithActivities;
  tags: Tag[] | undefined;
};

export const MemberSidebar = ({ member, tags }: Props) => {
  const { id, source, phones, job_title } = member;

  const onUpdateMember = async (
    field: "phone" | "job_title" | "bio" | "source",
    value: string,
  ) => {
    await _updateMember({ id, [field]: value });
  };

  return (
    <div className="flex-1 p-4 max-w-64 space-y-6">
      <p className="text-xs text-muted-foreground">MEMBER DETAILS</p>
      <FieldCard icon="Code" label="Source">
        <p>{source}</p>
      </FieldCard>
      <FieldCard icon="Tag" label="Tags">
        <TagPicker member={member} tags={tags} />
      </FieldCard>
      <FieldCard icon="Mail" label="Emails">
        <EditableEmails member={member} />
      </FieldCard>
      <FieldCard icon="Phone" label="Phone">
        <EditablePhones member={member} />
      </FieldCard>
      <FieldCard icon="Briefcase" label="Job title">
        <EditableInput
          defaultValue={job_title}
          placeholder="Set job title"
          onUpdate={(value) => onUpdateMember("job_title", value)}
        />
      </FieldCard>
      <FieldCard icon="AlignLeft" label="Bio">
        <EditableInput
          textArea
          defaultValue={member.bio}
          placeholder="Set bio"
          onUpdate={(value) => onUpdateMember("bio", value)}
        />
      </FieldCard>
      <FieldCard icon="MapPin" label="Address">
        <AddressInput member={member} />
      </FieldCard>
    </div>
  );
};
