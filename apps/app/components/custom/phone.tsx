import { Member } from "@conquest/zod/schemas/member.schema";
import { KeyboardEvent, useState } from "react";
import { toast } from "sonner";
import { PhoneInput } from "./phone-input";

type Props = {
  member: Member;
  onUpdate: (field: keyof Member, value: string | string[]) => void;
  onCancel: () => void;
};

export const Phone = ({ member, onUpdate, onCancel }: Props) => {
  const [phone, setPhone] = useState("");

  const onConfirm = () => {
    if (!phone || !phone.trim()) return;

    const formattedPhone = phone.trim();

    if (member.phones.includes(formattedPhone)) {
      return toast.error("This phone number already exists");
    }

    const updatedPhones = [...member.phones, formattedPhone];
    onUpdate("phones", updatedPhones);

    setPhone("");
  };

  const onBlur = () => {
    onCancel();
    onConfirm();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onCancel();
      onConfirm();
    }

    if (event.key === "Escape") {
      onCancel();
    }
  };

  return (
    <PhoneInput
      autoFocus
      placeholder="Add phone"
      defaultCountry="FR"
      value={phone}
      onChange={(event) => setPhone(event)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  );
};
