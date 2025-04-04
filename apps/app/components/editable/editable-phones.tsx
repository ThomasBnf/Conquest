"use client";

import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@conquest/ui/dropdown-menu";
import type { Member } from "@conquest/zod/schemas/member.schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { Phone } from "../custom/phone";

type Props = {
  member: Member;
};

export const EditablePhones = ({ member }: Props) => {
  const [open, setOpen] = useState(false);
  const [phones, setPhones] = useState<{ id: string; content: string }[]>(
    member.phones.map((phone) => ({ id: uuid(), content: phone })) ?? [],
  );
  const utils = trpc.useUtils();

  const { mutateAsync: updateMember } = trpc.members.update.useMutation({
    onSuccess: () => {
      utils.members.get.invalidate({ id: member.id });
    },
  });

  const onAddPhone = () => {
    setPhones([...phones, { id: uuid(), content: "" }]);
  };

  const onChangePhone = (id: string, newPhone: string) => {
    const phoneRegex = /^\+(?:[0-9] ?){6,14}[0-9]$/;

    if (!phoneRegex.test(newPhone)) {
      const newPhones = phones.filter((phone) => phone.id !== id);
      setPhones(newPhones);
      updateMember({
        ...member,
        phones: newPhones.map((phone) => phone.content),
      });
      return toast.error("invalid phone number");
    }

    const updatedPhones = phones.map((phone) =>
      phone.id === id ? { id: phone.id, content: newPhone } : phone,
    );
    setPhones(updatedPhones);
    updateMember({
      ...member,
      phones: updatedPhones.map((phone) => phone.content),
    });
  };

  const onDeletePhone = (id: string) => {
    const updatedPhones = phones.filter((phone) => phone.id !== id);
    setPhones(updatedPhones);

    updateMember({
      ...member,
      phones: updatedPhones.map((phone) => phone.content),
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className="w-full cursor-pointer">
        {phones.filter((phone) => phone.content !== "").length > 0 ? (
          <div className="flex min-h-8 flex-wrap gap-1 rounded-md p-1 hover:bg-muted-hover">
            {phones.map((phone) => {
              if (phone.content === "") return;
              return (
                <Button
                  key={phone.id}
                  variant="outline"
                  size="xs"
                  className="w-fit justify-start border-main-200 text-main-400 hover:bg-background hover:text-main-400"
                >
                  {phone.content}
                </Button>
              );
            })}
          </div>
        ) : (
          <Button
            variant="ghost"
            className="justify-start text-muted-foreground"
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
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)]"
      >
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
        <Button
          variant="ghost"
          onClick={onAddPhone}
          className="w-full justify-start"
        >
          <Plus size={16} />
          Add phone
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
