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
import { CommandLoading } from "cmdk";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import usePlacesAutocomplete from "use-places-autocomplete";

type Props = {
  address: string | null;
  onUpdate: (value: string | null) => void;
};

export function EditableAddress({ address, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(address);
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

  const onSelect = (newAddress: string | null) => {
    setOpen(false);
    setSelectedAddress(newAddress);
    onUpdate(newAddress);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "-ml-[9px] w-full cursor-pointer justify-start",
        )}
        asChild
      >
        {selectedAddress ? (
          <div className="relative">
            <span className="line-clamp-1 text-balance text-start">
              {selectedAddress}
            </span>
            {open && (
              <Button
                variant="outline"
                size="icon"
                className="absolute inset-y right-1"
                onClick={() => onSelect(null)}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">Set address</span>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
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
            className="h-9 w-[calc(100%-44px)]"
          />
          {value && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1.5 right-1"
              onClick={() => {
                setValue("");
                ref.current?.focus();
              }}
            >
              <X size={16} />
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
