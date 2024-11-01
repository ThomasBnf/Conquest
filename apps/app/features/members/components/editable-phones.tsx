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
  const [isOpen, setIsOpen] = useState(false);
  const [phones, setPhones] = useState<{ id: string; content: string }[]>(
    member.phones.map((phone) => ({ id: cuid(), content: phone })),
  );

  const onAddPhone = () => {
    setPhones([...phones, { id: cuid(), content: "" }]);
  };

  const onChangePhone = (id: string, newPhone: string) => {
    const phoneRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!phoneRegex.test(newPhone)) {
      const newPhones = phones.filter((phone) => phone.id !== id);
      setPhones(newPhones);
      _updateMember({
        id: member.id,
        phones: newPhones.map((phone) => phone.content),
      });
      return toast.error("Invalid phone format");
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex flex-col gap-1 w-fit">
        {phones.map((phone) => {
          if (phone.content === "") return;
          return (
            <PopoverTrigger asChild key={phone.id}>
              <Button
                key={phone.id}
                variant="outline"
                size="xs"
                className="text-blue-500 hover:text-blue-500 justify-start w-fit"
                onClick={() => setIsOpen(true)}
              >
                {phone.content}
              </Button>
            </PopoverTrigger>
          );
        })}
      </div>
      <PopoverContent align="start" className="w-80 p-0">
        <Command loop>
          <CommandList>
            <CommandGroup>
              {phones.map((phone) => (
                <Phone
                  key={phone.id}
                  phone={phone}
                  setIsOpen={setIsOpen}
                  onChangePhone={(newPhone) =>
                    onChangePhone(phone.id, newPhone.phone)
                  }
                  onDeletePhone={onDeletePhone}
                />
              ))}
              <Separator className="-mx-2 w-[calc(100%+1rem)] my-1" />
              <CommandItem onClick={onAddPhone} onSelect={onAddPhone}>
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
