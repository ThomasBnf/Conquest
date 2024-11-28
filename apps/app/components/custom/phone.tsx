import { PhoneInput } from "@/components/custom/phone-input";
import { Button } from "@conquest/ui/button";
import { CommandItem } from "cmdk";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type Props = {
  phone: { id: string; content: string };
  setOpen: (isOpen: boolean) => void;
  onChangePhone: ({ id, phone }: { id: string; phone: string }) => void;
  onDeletePhone: (phone: string) => void;
};

export const Phone = ({
  phone,
  setOpen,
  onChangePhone,
  onDeletePhone,
}: Props) => {
  const [value, setValue] = useState(phone.content);

  return (
    <CommandItem className="flex h-8 items-center justify-between gap-1">
      {phone.content ? (
        <p className="truncate pl-1">{phone.content}</p>
      ) : (
        <PhoneInput
          autoFocus
          defaultCountry="FR"
          className="h-8 px-0"
          value={value}
          onChange={(value) => setValue(value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setOpen(false);
              setTimeout(() => {
                if (value === "") {
                  onDeletePhone(phone.id);
                } else {
                  onChangePhone({ id: phone.id, phone: value });
                }
              }, 100);
            }
            if (event.key === "Escape") {
              setOpen(false);
              onDeletePhone(phone.id);
            }
          }}
        />
      )}
      <Button
        variant="outline"
        size="icon"
        className="mr-1 shrink-0"
        onClick={() => onDeletePhone(phone.id)}
      >
        <Trash2 size={15} />
      </Button>
    </CommandItem>
  );
};
