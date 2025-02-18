import { useFilters } from "@/context/filtersContext";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import type { FilterActivity } from "@conquest/zod/schemas/filters.schema";
import { ChevronDown, Hash } from "lucide-react";
import { useState } from "react";

type Props = {
  filter: FilterActivity;
};

export const ChannelsPicker = ({ filter }: Props) => {
  const { onUpdateFilter } = useFilters();
  const [open, setOpen] = useState(false);
  const { data } = trpc.channels.getAllChannels.useQuery({});

  const onSelect = (channel: Channel) => {
    const hasChannel = filter.channels.some((c) => c.id === channel.id);

    onUpdateFilter({
      ...filter,
      channels: hasChannel
        ? filter.channels.filter((c) => c.id !== channel.id)
        : [...filter.channels, { id: channel.id, label: channel.name }],
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" classNameSpan="justify-between">
          {filter.channels.length === 2 ? (
            "2 channels"
          ) : filter.channels.length ? (
            `${filter.channels.map((channel) => `#${channel.label}`).join(", ")}`
          ) : (
            <span className="text-muted-foreground">Select channel</span>
          )}
          <ChevronDown size={16} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Command loop>
          <CommandList>
            <CommandGroup>
              {data?.map((channel) => (
                <CommandItem
                  key={channel.id}
                  onSelect={() => onSelect(channel)}
                >
                  <Checkbox
                    checked={filter.channels.some((c) => c.id === channel.id)}
                  />
                  <Hash size={16} className="ml-2" />
                  <span>{channel.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
