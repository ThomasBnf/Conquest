"use client";

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
import { cn } from "@conquest/ui/utils/cn";
import type { Member } from "@conquest/zod/member.schema";
import { updateMember } from "actions/members/updateMember";
import { Check, MapPin, X } from "lucide-react";
import { useState } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";

type Props = {
  member: Member;
};

export function AddressInput({ member }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(member.address);

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
    updateMember({ id: member.id, address });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-1.5">
        <MapPin size={15} className="shrink-0 text-muted-foreground" />
        <PopoverTrigger asChild>
          <div className="group flex items-center gap-1">
            <Button variant="ghost" size="xs">
              {selectedAddress ?? (
                <span className="text-muted-foreground">Set address</span>
              )}
            </Button>
            {selectedAddress && (
              <Button
                variant="secondary"
                size="xs"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(null);
                }}
              >
                <X size={15} />
              </Button>
            )}
          </div>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput
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
          <CommandList>
            <CommandEmpty>No address found.</CommandEmpty>
            <CommandGroup>
              {status === "OK" &&
                data.map(({ place_id, description }) => (
                  <CommandItem
                    key={place_id}
                    value={description}
                    onSelect={() => onSelect(description)}
                  >
                    {description}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value === description ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
