"use client";

import { EditableAddress } from "@/components/editable/editable-address";
import { EditableDate } from "@/components/editable/editable-date";
import { EditableInput } from "@/components/editable/editable-input";
import { EditableMembers } from "@/components/editable/editable-members";
import { FieldCard } from "@/components/editable/field-card";
import { TagPicker } from "@/features/tags/tag-picker";
import { trpc } from "@/server/client";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { Company } from "@conquest/zod/schemas/company.schema";
import { format } from "date-fns";
import { TagIcon } from "lucide-react";

type Props = {
  company: Company;
};

export const CompanySidebar = ({ company }: Props) => {
  const { mutateAsync } = trpc.companies.update.useMutation();

  const {
    id,
    name,
    domain,
    industry,
    employees,
    address,
    founded_at,
    logo_url,
    created_at,
  } = company;

  const onUpdateCompany = async (
    field:
      | "name"
      | "tags"
      | "domain"
      | "industry"
      | "employees"
      | "address"
      | "founded_at",
    value: string | Date | string[] | null,
  ) => {
    await mutateAsync({ ...company, [field]: value });
  };

  return (
    <div className="flex h-full max-w-sm flex-1 flex-col bg-sidebar">
      <div className="flex items-center gap-2 p-4">
        <Avatar className="size-12">
          <AvatarImage src={logo_url ?? ""} />
          <AvatarFallback className="text-sm">
            {name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <p className="truncate font-medium text-base leading-tight">{name}</p>
          <p className="text-muted-foreground text-xs">{id}</p>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <TagIcon size={16} className="shrink-0" />
          <p>Tags</p>
        </div>
        <TagPicker
          record={company}
          onUpdate={(value) => onUpdateCompany("tags", value)}
        />
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          <p className="text-muted-foreground text-xs">COMPANY DETAILS</p>
          <FieldCard icon="Building2" label="Name">
            <EditableInput
              defaultValue={name}
              placeholder="Set name"
              onUpdate={(value) => onUpdateCompany("name", value)}
            />
          </FieldCard>
          <FieldCard icon="Users" label="Members">
            <EditableMembers company={company} />
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
        <div className="space-y-2 p-4">
          <FieldCard icon="CalendarCheck" label="Founded at">
            <EditableDate
              defaultValue={founded_at ? format(founded_at, "PPp") : undefined}
              onUpdate={(value) => onUpdateCompany("founded_at", value)}
            />
          </FieldCard>
          <FieldCard icon="CalendarPlus" label="Created at">
            <p className="h-8 place-content-center pl-0.5">
              <span className="px-[7px]">{format(created_at, "PPp")}</span>
            </p>
          </FieldCard>
        </div>
      </ScrollArea>
    </div>
  );
};
