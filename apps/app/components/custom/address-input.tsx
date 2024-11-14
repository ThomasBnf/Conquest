"use client";

import { _updateMember } from "@/features/members/actions/_updateMember";
import { Button, buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Skeleton } from "@conquest/ui/skeleton";
import type { Member } from "@conquest/zod/member.schema";
import { CommandLoading } from "cmdk";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";

type Props = {
  member: Member;
};

export function AddressInput({ member }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(member.address);
  const ref = useRef<HTMLInputElement>(null);

  const {
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    callbackName: "initMap",
    debounce: 300,
    requestOptions: {
      types: ["address"],
    },
  });

  const onSelect = (address: string | null) => {
    setOpen(false);
    setSelectedAddress(address);
    _updateMember({ id: member.id, address });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "xs" }),
          "-ml-1.5",
        )}
        onClick={() => setValue(selectedAddress ?? "")}
      >
        {selectedAddress ?? (
          <span className="text-muted-foreground">Set address</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command className="relative">
          <CommandInput
            ref={ref}
            placeholder="Search address..."
            value={value}
            onValueChange={(text) => {
              setValue(text);
              if (text === "") {
                clearSuggestions();
              }
            }}
            className="h-9"
          />
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1.5"
              onClick={() => {
                setValue("");
                ref.current?.focus();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <CommandList>
            {status === "" && value ? (
              <CommandLoading className="p-1">
                <Skeleton className="h-8 w-full bg-muted" />
              </CommandLoading>
            ) : (
              <CommandEmpty>No address found.</CommandEmpty>
            )}
            <CommandGroup>
              {status === "OK" &&
                data.map(({ place_id, description }) => (
                  <CommandItem
                    key={place_id}
                    value={description}
                    onSelect={() => onSelect(description)}
                  >
                    {description}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
