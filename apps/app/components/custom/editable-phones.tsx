"use client";

import { updateMember } from "@/actions/members/updateMember";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Member } from "@conquest/zod/schemas/member.schema";
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
      updateMember({
        id: member.id,
        phones: newPhones.map((phone) => phone.content),
      });
      return toast.error("invalid phone number");
    }

    const updatedPhones = phones.map((phone) =>
      phone.id === id ? { id: phone.id, content: newPhone } : phone,
    );
    setPhones(updatedPhones);
    updateMember({
      id: member.id,
      phones: updatedPhones.map((phone) => phone.content),
    });
  };

  const onDeletePhone = (id: string) => {
    const updatedPhones = phones.filter((phone) => phone.id !== id);
    setPhones(updatedPhones);
    updateMember({
      id: member.id,
      phones: updatedPhones.map((phone) => phone.content),
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className="w-full cursor-pointer">
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[233px]">
        <div className="space-y-0.5">
          {phones.length > 0 && (
            <>
              <div className="space-y-0.5">
                {phones.map((phone) => (
                  <Phone
                    key={phone.id}
                    phone={phone}
                    setOpen={setOpen}
                    onChangePhone={(newPhone) =>
                      onChangePhone(phone.id, newPhone.phone)
                    }
                    onDeletePhone={onDeletePhone}
                  />
                ))}
              </div>
              <DropdownMenuSeparator />
            </>
          )}
        </div>
        <Button
          variant="ghost"
          className="w-full"
          classNameSpan="justify-start"
          onClick={onAddPhone}
        >
          <Plus size={15} />
          Add phone
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
