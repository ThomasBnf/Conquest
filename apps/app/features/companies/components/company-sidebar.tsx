"use client";

import { EditableAddress } from "@/components/custom/editable-address";
import { EditableInput } from "@/components/custom/editable-input";
import { FieldCard } from "@/components/custom/field-card";
import { TagPicker } from "@/features/tags/tag-picker";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { Company } from "@conquest/zod/company.schema";
import type { Tag } from "@conquest/zod/tag.schema";
import { format } from "date-fns";

type Props = {
  company: Company;
  tags: Tag[] | undefined;
};

export const CompanySidebar = ({ company, tags }: Props) => {
  const {
    id,
    name,
    domain,
    industry,
    employees,
    address,
    founded_at,
    source,
    logo_url,
    created_at,
  } = company;

  const onUpdateCompany = async (
    field:
      | "name"
      | "title"
      | "description"
      | "domain"
      | "industry"
      | "employees"
      | "address"
      | "founded_at",
    value: string,
  ) => {
    // await _updateMember({ id, [field]: value });
  };

  return (
    <div className="flex flex-col h-full flex-1 max-w-md">
      <div className="flex items-center gap-2 p-4">
        <Avatar className="size-12">
          <AvatarImage src={logo_url ?? ""} />
          <AvatarFallback className="text-sm">
            {name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-base font-medium leading-tight">{name}</p>
          <p className="text-xs text-muted-foreground">{id}</p>
        </div>
      </div>
      <Separator />
      <div className="p-4 space-y-2">
        <FieldCard icon="Code" label="Source">
          <p className="pl-1.5">{source}</p>
        </FieldCard>
        <FieldCard icon="Tag" label="Tags">
          <TagPicker record={company} tags={tags} />
        </FieldCard>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground">COMPANY DETAILS</p>
          <FieldCard icon="Building2" label="Name">
            <EditableInput
              defaultValue={name}
              placeholder="Set name"
              onUpdate={(value) => onUpdateCompany("name", value)}
            />
          </FieldCard>
          <FieldCard icon="Globe" label="Domain">
            <EditableInput
              defaultValue={domain}
              placeholder="Set domain"
              onUpdate={(value) => onUpdateCompany("domain", value)}
            />
          </FieldCard>
          <FieldCard icon="Briefcase" label="Industry">
            <EditableInput
              defaultValue={industry}
              placeholder="Set industry"
              onUpdate={(value) => onUpdateCompany("industry", value)}
            />
          </FieldCard>
          <FieldCard icon="Users" label="Employees">
            <EditableInput
              defaultValue={employees?.toString() ?? ""}
              placeholder="Set employees"
              onUpdate={(value) => onUpdateCompany("employees", value)}
            />
          </FieldCard>
          <FieldCard icon="MapPin" label="Address">
            <EditableAddress
              address={address}
              onUpdate={(value) => onUpdateCompany("address", value)}
            />
          </FieldCard>
        </div>
        <Separator />
        <div className="p-4 space-y-2">
          <FieldCard icon="CalendarCheck" label="Founded at">
            <EditableInput
              defaultValue={founded_at ? format(founded_at, "PP p") : ""}
              placeholder="Set founded date"
              onUpdate={(value) => onUpdateCompany("founded_at", value)}
            />
          </FieldCard>
          <FieldCard icon="CalendarPlus" label="Created at">
            <p className="pl-1.5">{format(created_at, "PP p")}</p>
          </FieldCard>
        </div>
      </ScrollArea>
    </div>
  );
};
