import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@conquest/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import type { Channel } from "@conquest/zod/schemas/channel.schema";
import { ChevronsUpDown, Hash } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { FormActivityType } from "./schema/form.schema";

type Props = {
  form: UseFormReturn<FormActivityType>;
  index: number;
  channels: Channel[] | undefined;
};

export const ConditionChannel = ({ form, index, channels }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name={`conditions.rules.${index}.channelId`}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
            <Popover open={open} onOpenChange={setOpen} modal>
              <PopoverTrigger className="flex h-[34px] w-full items-center overflow-hidden rounded-md border">
                <>
                  <p className="h-[34px] w-fit place-content-center border-r bg-muted px-2">
                    In
                  </p>
                  <div className="flex w-full cursor-pointer items-center justify-between px-2">
                    <p>
                      {channels?.find((c) => c.id === field.value)?.name ?? (
                        <span className="text-muted-foreground">
                          Select channel
                        </span>
                      )}
                    </p>
                    <ChevronsUpDown
                      size={13}
                      className="ml-2 text-muted-foreground"
                    />
                  </div>
                </>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="start">
                <Command loop>
                  <CommandInput placeholder="Search..." />
                  <CommandList>
                    <CommandEmpty>No channels found</CommandEmpty>
                    <CommandGroup>
                      {channels?.map((channel) => (
                        <CommandItem
                          key={channel.id}
                          value={channel.name}
                          onSelect={() => {
                            field.onChange(channel.id);
                            setOpen(false);
                          }}
                        >
                          <div className="flex items-start gap-1">
                            <Hash
                              size={16}
                              className="shrink-0 translate-y-0.5"
                            />
                            {channel.name}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
