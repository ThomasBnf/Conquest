import { PhoneInput } from "@/components/custom/phone-input";
import { Button } from "@conquest/ui/button";
import { CommandItem } from "@conquest/ui/command";
import { Trash2 } from "lucide-react";
import { type FocusEvent, useState } from "react";

type Props = {
  phone: { id: string; content: string };
  setIsOpen: (isOpen: boolean) => void;
  onChangePhone: ({ id, phone }: { id: string; phone: string }) => void;
  onDeletePhone: (phone: string) => void;
};

export const Phone = ({
  phone,
  setIsOpen,
  onChangePhone,
  onDeletePhone,
}: Props) => {
  const [value, setValue] = useState(phone.content);

  return (
    <CommandItem className="flex h-8 items-center justify-between gap-1">
      {phone.content ? (
        <p className="truncate">{phone.content}</p>
      ) : (
        <PhoneInput
          autoFocus
          placeholder="phone@example.com"
          className="h-8 px-0"
          value={value}
          onChange={(value) => setValue(value)}
          onBlur={(event: FocusEvent<HTMLInputElement>) => {
            if (value === "") {
              onDeletePhone(phone.id);
            } else {
              onChangePhone({ id: phone.id, phone: event.target.value });
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              if (value === "") return;
              onChangePhone({ id: phone.id, phone: value });
              setIsOpen(false);
            }
            if (event.key === "Escape") {
              setIsOpen(false);
              onDeletePhone(phone.id);
            }
          }}
        />
      )}
      <Button
        variant="outline"
        size="icon"
        className="ml-4 shrink-0"
        onClick={() => onDeletePhone(phone.id)}
      >
        <Trash2 size={15} />
      </Button>
    </CommandItem>
  );
};
