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
import ISO6391 from "iso-639-1";
import { useState } from "react";
import { LanguageBadge } from "../badges/language-badge";

type Props = {
  language: string | null;
  onUpdate: (value: string | null) => void;
};

export const EditableLanguage = ({ language, onUpdate }: Props) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(language);

  const languages = ISO6391.getAllNames();

  const onUpdateLocale = (language: string) => {
    setValue(language);
    onUpdate(language);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="w-full justify-start truncate p-1">
          {value ? (
            <LanguageBadge language={value} />
          ) : (
            <span className="text-muted-foreground">Set language</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[233px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {languages?.map((language) => (
                <CommandItem
                  key={language}
                  value={language}
                  onSelect={() => onUpdateLocale(language)}
                  className="h-8"
                >
                  {language}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
