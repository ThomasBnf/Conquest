import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { formatCamelCase } from "@conquest/utils/formatCamelCase";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { useState } from "react";
import { AddCustomFieldDialog } from "../custom-fields/add-custom-field-dialog";

type Props = {
  value: string | undefined;
  onValueChange: (value: string) => void;
  onClear: () => void;
};

export const AttributesPicker = ({ value, onValueChange, onClear }: Props) => {
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const { data: fields } = trpc.customFields.list.useQuery({
    record: "MEMBER",
  });

  const isCustomField = fields?.some((field) => field.id === value);
  const customField = fields?.find((field) => field.id === value)?.label;

  const onSelect = (value: string) => {
    onValueChange(value);
    setOpen(false);
  };

  const MEMBER_ATTRIBUTES = [
    "firstName",
    "lastName",
    "primaryEmail",
    "emails",
    "tags",
    "phones",
    "jobTitle",
    "avatarUrl",
    "country",
    "language",
    "linkedinUrl",
    "isStaff",
    "createdAt",
    "updatedAt",
  ];

  const SOCIAL_ATTRIBUTES = {
    Company: [{ value: "company", label: "Company Name" }],
    Profiles: [
      { value: "discordId", label: "Discord Id" },
      { value: "discourseUsername", label: "Discourse Username" },
      { value: "githubLogin", label: "GitHub Login" },
      { value: "slackId", label: "Slack Id" },
      { value: "twitterUsername", label: "Twitter Username" },
    ],
  };

  return (
    <>
      <AddCustomFieldDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onSelect={onSelect}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            {value ? (
              <>
                <span className="capitalize">
                  {isCustomField ? customField : formatCamelCase(value)}
                </span>
                <div onClick={onClear}>
                  <X size={14} />
                </div>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">Select attribute</span>
                <ChevronDown size={16} className="text-muted-foreground" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search attribute..." />
            <CommandEmpty>No attribute found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {Object.entries(MemberSchema.shape)
                  .filter(([key]) => MEMBER_ATTRIBUTES.includes(key))
                  .map(([key]) => key)
                  .sort()
                  .map((key) => (
                    <CommandItem
                      key={key}
                      value={key}
                      onSelect={onSelect}
                      className="capitalize"
                    >
                      {formatCamelCase(key)}
                      {value === key && <Check size={16} className="ml-auto" />}
                    </CommandItem>
                  ))}
              </CommandGroup>
              {Object.entries(SOCIAL_ATTRIBUTES).map(([heading, items]) => (
                <CommandGroup key={heading} heading={heading}>
                  {items.map(({ value: itemValue, label }) => (
                    <CommandItem
                      key={itemValue}
                      value={itemValue}
                      onSelect={onSelect}
                    >
                      {label}
                      {value === itemValue && (
                        <Check size={16} className="ml-auto" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
              {fields && fields.length > 0 && (
                <CommandGroup heading="Custom fields">
                  {fields.map((field) => (
                    <CommandItem
                      key={field.id}
                      value={field.label}
                      onSelect={() => onSelect(field.id)}
                    >
                      {field.label}
                      {value === field.id && (
                        <Check size={16} className="ml-auto" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => setOpenDialog(true)}
                className="cursor-pointer"
              >
                <Plus size={16} />
                Add custom field
              </CommandItem>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};
