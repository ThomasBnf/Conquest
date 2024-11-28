"use client";

import { _updateMember } from "@/features/members/actions/_updateMember";
import { Button } from "@conquest/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@conquest/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@conquest/ui/popover";
import { Separator } from "@conquest/ui/separator";
import type { Member } from "@conquest/zod/member.schema";
import cuid from "cuid";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Phone } from "./phone";

type Props = {
  member: Member;
};

export const EditablePhones = ({ member }: Props) => {
  const [open, setOpen] = useState(false);
  const [phones, setPhones] = useState<{ id: string; content: string }[]>(
    member.phones.map((phone) => ({ id: cuid(), content: phone })),
  );

  const onAddPhone = () => {
    setPhones([...phones, { id: cuid(), content: "" }]);
  };

  const onChangePhone = (id: string, newPhone: string) => {
    const phoneRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/;

    if (!phoneRegex.test(newPhone)) {
      const newPhones = phones.filter((phone) => phone.id !== id);
      setPhones(newPhones);
      _updateMember({
        id: member.id,
        phones: newPhones.map((phone) => phone.content),
      });
      return toast.error("invalid phone number");
    }

    const updatedPhones = phones.map((phone) =>
      phone.id === id ? { id: phone.id, content: newPhone } : phone,
    );
    setPhones(updatedPhones);
    _updateMember({
      id: member.id,
      phones: updatedPhones.map((phone) => phone.content),
    });
  };

  const onDeletePhone = (id: string) => {
    const updatedPhones = phones.filter((phone) => phone.id !== id);
    setPhones(updatedPhones);
    _updateMember({
      id: member.id,
      phones: updatedPhones.map((phone) => phone.content),
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full cursor-pointer">
        {phones.filter((phone) => phone.content !== "").length > 0 ? (
          <div className="flex w-full flex-col gap-1 rounded-md p-1 hover:bg-muted">
            {phones.map((phone) => {
              if (phone.content === "") return;
              return (
                <Button
                  key={phone.id}
                  variant="outline"
                  size="xs"
                  className="w-fit justify-start border-blue-200 text-blue-500 hover:bg-background hover:text-blue-500"
                  onClick={() => setOpen(true)}
                >
                  {phone.content}
                </Button>
              );
            })}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="xs"
            className="w-fit"
            classNameSpan="text-muted-foreground justify-start"
            onClick={() => {
              setOpen(true);
              if (phones.length === 0) {
                onAddPhone();
              }
            }}
          >
            Set phones
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[297px] p-0">
        <Command loop>
          <CommandList>
            <CommandGroup>
              {phones.length > 0 ? (
                phones.map((phone) => (
                  <Phone
                    key={phone.id}
                    phone={phone}
                    setOpen={setOpen}
                    onChangePhone={(newPhone) =>
                      onChangePhone(phone.id, newPhone.phone)
                    }
                    onDeletePhone={onDeletePhone}
                  />
                ))
              ) : (
                <p className="p-1 text-muted-foreground">No phones set</p>
              )}
              <Separator className="-mx-2 my-1 w-[calc(100%+1rem)]" />
              <CommandItem onSelect={onAddPhone}>
                <Plus size={15} />
                <p>Add phone</p>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
