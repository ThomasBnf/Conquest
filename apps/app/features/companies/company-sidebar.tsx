"use client";

import { EditableAddress } from "@/components/editable/editable-address";
import { EditableDate } from "@/components/editable/editable-date";
import { EditableInput } from "@/components/editable/editable-input";
import { EditableMembers } from "@/components/editable/editable-members";
import { EditableNumber } from "@/components/editable/editable-number";
import { FieldCard } from "@/components/editable/field-card";
import { Avatar, AvatarFallback, AvatarImage } from "@conquest/ui/avatar";
import { cn } from "@conquest/ui/cn";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Separator } from "@conquest/ui/separator";
import type { Company } from "@conquest/zod/schemas/company.schema";
import { format } from "date-fns";
import { AddCustomField } from "../custom-fields/add-custom-field";
import { CustomFieldsParser } from "../custom-fields/custom-fields-parser";
import { TagPicker } from "../tags/tag-picker";
import { useUpdateCompany } from "./mutations/useUpdateCompany";

type Props = {
  company: Company;
};

export const CompanySidebar = ({ company }: Props) => {
  const updateCompany = useUpdateCompany();

  const {
    id,
    name,
    domain,
    industry,
    employees,
    address,
    foundedAt,
    logoUrl,
    createdAt,
  } = company;

  const onUpdateCompany = async (
    field: keyof Company,
    value: string | string[] | Date | number | null,
  ) => {
    console.log(field, value);
    if (company[field] === value) return;
    updateCompany({ ...company, [field]: value });
  };
  return (
    <div className="flex h-full max-w-sm flex-1 flex-col bg-sidebar">
      <div className="flex items-center gap-2 p-4">
        <Avatar className="size-12">
          <AvatarImage src={logoUrl ?? ""} />
          <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <p className="truncate font-medium text-base leading-tight">{name}</p>
          <p className="text-muted-foreground text-xs">{id}</p>
        </div>
      </div>
      <Separator />
      <div className="space-y-4 p-4">
        <FieldCard label="Tags">
          <TagPicker
            variant="ghost"
            tags={company.tags}
            onUpdate={(value) => onUpdateCompany("tags", value)}
            className={cn(
              "text-muted-foreground",
              company.tags.length > 0 ? "min-h-8" : "-ml-[7px]",
            )}
          />
        </FieldCard>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          <FieldCard label="Name">
            <EditableInput
              defaultValue={name}
              placeholder="Set name"
              onUpdate={(value) => onUpdateCompany("name", value)}
            />
          </FieldCard>
          <FieldCard label="Members">
            <EditableMembers company={company} />
          </FieldCard>
          <FieldCard label="Domain">
            <EditableInput
              defaultValue={domain}
              placeholder="Set domain"
              onUpdate={(value) => onUpdateCompany("domain", value)}
            />
          </FieldCard>
          <FieldCard label="Industry">
            <EditableInput
              defaultValue={industry}
              placeholder="Set industry"
              onUpdate={(value) => onUpdateCompany("industry", value)}
            />
          </FieldCard>
          <FieldCard label="Employees">
            <EditableNumber
              defaultValue={employees ?? null}
              placeholder="Set employees"
              onUpdate={(value) => onUpdateCompany("employees", value)}
            />
          </FieldCard>
          <FieldCard label="Address">
            <EditableAddress
              address={address}
              onUpdate={(value) => onUpdateCompany("address", value)}
            />
          </FieldCard>
          <CustomFieldsParser record="COMPANY" company={company} />
          <AddCustomField record="COMPANY" />
        </div>
        <Separator />
        <div className="space-y-4 p-4">
          <FieldCard label="Founded at">
            <EditableDate
              defaultValue={foundedAt ? format(foundedAt, "PPp") : undefined}
              onUpdate={(value) => onUpdateCompany("foundedAt", value)}
            />
          </FieldCard>
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
