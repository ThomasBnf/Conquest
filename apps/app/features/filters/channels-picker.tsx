import { listChannels } from "@/client/channels/listChannels";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { FilterActivity } from "@conquest/zod/schemas/filters.schema";
import { useState } from "react";

type Props = {
  filter: FilterActivity;
  handleUpdate: (channel: { id: string; label: string }) => void;
};

export const ChannelsPicker = ({ filter, handleUpdate }: Props) => {
  const [open, setOpen] = useState(false);
  const { channels } = listChannels();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="dropdown">
          {filter.channels.length ? (
            filter.channels.map((channel) => `# ${channel.label}`).join(", ")
          ) : (
            <span className="text-muted-foreground">Select channel</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command className="w-fit">
          <CommandList>
            <CommandGroup>
              {channels?.map((channel) => (
                <CommandItem
                  key={channel.id}
                  onSelect={() => {
                    handleUpdate({ id: channel.id, label: channel.name });
                    setOpen(false);
                  }}
                >
                  <Checkbox
                    checked={filter.channels.some((c) => c.id === channel.id)}
                    className="mr-2"
                  />
                  <span># {channel.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
