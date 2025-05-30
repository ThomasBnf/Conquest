import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { MemberSchema } from "@conquest/zod/schemas/member.schema";
import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";

type Props = {
  value: string | undefined;
  onValueChange: (value: string) => void;
  onClear: () => void;
};

export const AttributesPicker = ({ value, onValueChange, onClear }: Props) => {
  const [open, setOpen] = useState(false);

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
    Discord: [
      { value: "discordId", label: "Discord Id" },
      { value: "discordUsername", label: "Discord Username" },
    ],
    Discourse: [
      { value: "discourseId", label: "Discourse Id" },
      { value: "discourseUsername", label: "Discourse Username" },
    ],
    GitHub: [
      { value: "githubLogin", label: "GitHub Login" },
      { value: "githubBio", label: "GitHub Bio" },
      { value: "githubFollowers", label: "GitHub Followers" },
      { value: "githubLocation", label: "GitHub Location" },
    ],
    Slack: [
      { value: "slackId", label: "Slack Id" },
      { value: "slackRealName", label: "Slack Real Name" },
    ],
    Twitter: [
      { value: "twitterId", label: "Twitter Id" },
      { value: "twitterUsername", label: "Twitter Username" },
    ],
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value ? (
            <>
              <span className="capitalize">
                {value
                  .replace(/([A-Z])/g, " $1")
                  .trim()
                  .toLowerCase()}
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
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
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
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .trim()
                      .toLowerCase()}
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
