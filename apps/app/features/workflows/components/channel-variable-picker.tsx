import { trpc } from "@/server/client";
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
import { Braces, ChevronDown, Hash } from "lucide-react";
import { useState } from "react";

type Props = {
  source: "Slack" | "Discord";
  onClick: (variable: string) => void;
};

export const ChannelVariablePicker = ({ source, onClick }: Props) => {
  const [open, setOpen] = useState(false);
  const { data } = trpc.channels.list.useQuery({ source });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between gap-2">
          <div className="flex items-center gap-2">
            <Braces size={14} />
            Channels
          </div>
          <ChevronDown size={14} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No channels found.</CommandEmpty>
            <CommandGroup>
              {data?.map((key) => (
                <CommandItem
                  key={key.id}
                  onSelect={() => onClick(`{{#${key.name}}}`)}
                  className="gap-1"
                >
                  <Hash size={14} />
                  {key.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
