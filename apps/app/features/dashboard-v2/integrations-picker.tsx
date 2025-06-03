import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export const IntegrationsPicker = () => {
  const [open, setOpen] = useState(false);
  const [integrations, setIntegrations] = useState<string[]>([]);

  const { data } = trpc.integrations.list.useQuery();

  const onSelect = (source: string) => {
    setIntegrations((prev) => [...prev, source]);
    setOpen(false);
  };

  useEffect(() => {
    setIntegrations(
      data?.map((integration) => integration.details.source) || [],
    );
  }, [data]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-expanded={open}>
          {integrations.join(", ")}
          <ChevronDown size={16} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search integration..." />
          <CommandEmpty>No integration found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {data?.map((integration) => {
                const { source } = integration.details;

                return (
                  <CommandItem
                    key={source}
                    value={source}
                    onSelect={onSelect}
                    className="flex items-center gap-2"
                  >
                    <Checkbox checked={integrations.includes(source)} />
                    {source}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
