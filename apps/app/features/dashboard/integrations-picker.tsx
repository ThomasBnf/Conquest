import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { cn } from "@conquest/ui/cn";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Discord } from "@conquest/ui/icons/Discord";
import { Discourse } from "@conquest/ui/icons/Discourse";
import { Github } from "@conquest/ui/icons/Github";
import { Livestorm } from "@conquest/ui/icons/Livestorm";
import { Slack } from "@conquest/ui/icons/Slack";
import { Twitter } from "@conquest/ui/icons/Twitter";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Skeleton } from "@conquest/ui/skeleton";
import { Source } from "@conquest/zod/enum/source.enum";
import { ChevronDown } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const logoMap = {
  Discord: Discord,
  Discourse: Discourse,
  Github: Github,
  Livestorm: Livestorm,
  Slack: Slack,
  Twitter: Twitter,
} as const;

type IntegrationSource = keyof typeof logoMap;

type Props = {
  sources: Source[];
  setSources: Dispatch<SetStateAction<Source[]>>;
};

export const IntegrationsPicker = ({ sources, setSources }: Props) => {
  const [open, setOpen] = useState(false);

  const { data: integrations, isLoading } = trpc.integrations.list.useQuery();

  const onToggleIntegration = (source: Source) => {
    setSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source],
    );
  };

  const selectedLogos = sources.map((source) => ({
    source,
    LogoComponent: logoMap[source as keyof typeof logoMap],
  }));

  useEffect(() => {
    const allSources = integrations?.map(
      (integration) => integration.details.source,
    );
    setSources(allSources ?? []);
  }, [isLoading]);

  if (!integrations?.length) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={isLoading}
          className={cn((selectedLogos.length > 0 || isLoading) && "pl-0.5")}
        >
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-5 w-12" />
            ) : selectedLogos.length > 0 ? (
              <div className="flex items-center">
                {selectedLogos.map(({ source, LogoComponent }, index) => (
                  <div
                    key={source}
                    className={cn(
                      "flex items-center justify-center rounded-md border bg-background p-1",
                      index > 0 && "-ml-2",
                    )}
                    style={{ zIndex: selectedLogos.length - index }}
                  >
                    <LogoComponent size={16} />
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">Select integrations</span>
            )}
            <ChevronDown size={16} className="text-muted-foreground" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search integration..." />
          <CommandEmpty>No integration found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {integrations?.map((integration) => {
                const { source } = integration.details;
                const isSelected = sources.includes(source);
                const LogoComponent = logoMap[source as IntegrationSource];

                return (
                  <CommandItem
                    key={source}
                    value={source}
                    onSelect={() => onToggleIntegration(source)}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleIntegration(source)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center gap-1">
                      {LogoComponent && <LogoComponent size={14} />}
                      {source}
                    </div>
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
