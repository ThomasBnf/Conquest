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
import { Braces, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useWorkflow } from "../context/workflowContext";

type Props = {
  onClick: (variable: string) => void;
};

export const MemberVariablePicker = ({ onClick }: Props) => {
  const [open, setOpen] = useState(false);
  const { node } = useWorkflow();

  const isWebhook = node?.data.type === "webhook";
  const isSlack = node?.data.type === "slack-message";
  const isDiscord = node?.data.type === "discord-message";

  const memberFields = [
    "First Name",
    "Last Name",
    "Primary Email",
    "Country",
    "Language",
    "Job Title",
    "LinkedIn URL",
    "Emails",
    "Phones",
    "Level",
    "Level Name",
  ];

  const getVariableValue = (key: string) => {
    return `{{${key.slice(0, 1).toLowerCase()}${key.slice(1).replaceAll(" ", "")}}}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between gap-2">
          <div className="flex items-center gap-2">
            <Braces size={14} />
            Member
          </div>
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No member fields found.</CommandEmpty>
            <CommandGroup>
              {isWebhook && (
                <CommandItem
                  onSelect={() => {
                    onClick("{{createdMember}}");
                    setOpen(false);
                  }}
                >
                  Created Member Data
                </CommandItem>
              )}
              {isSlack && (
                <CommandItem
                  onSelect={() => {
                    onClick("{{@slackProfile}}");
                    setOpen(false);
                  }}
                >
                  Mention member
                </CommandItem>
              )}
              {isDiscord && (
                <CommandItem
                  onSelect={() => {
                    onClick("{{@discordProfile}}");
                    setOpen(false);
                  }}
                >
                  Mention member
                </CommandItem>
              )}
              <CommandSeparator className="my-1" />
              {memberFields.map((key) => (
                <CommandItem
                  key={key}
                  onSelect={() => {
                    onClick(getVariableValue(key));
                    setOpen(false);
                  }}
                  className="capitalize"
                >
                  {key.replace(/_/g, " ")}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
