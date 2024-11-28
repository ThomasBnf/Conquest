import { Button } from "@conquest/ui/button";
import { CommandItem } from "@conquest/ui/command";
import { Input } from "@conquest/ui/input";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type Props = {
  email: { id: string; content: string };
  hasEmails: boolean;
  setOpen: (open: boolean) => void;
  onChangeEmail: ({ id, email }: { id: string; email: string }) => void;
  onDeleteEmail: (email: string) => void;
};

export const Email = ({
  email,
  hasEmails,
  setOpen,
  onChangeEmail,
  onDeleteEmail,
}: Props) => {
  const [value, setValue] = useState(email.content);

  return (
    <CommandItem className="flex h-8 items-center justify-between gap-1">
      {email.content ? (
        <p className="truncate">{email.content}</p>
      ) : (
        <Input
          autoFocus
          placeholder="email@example.com"
          variant="transparent"
          className="h-8 px-0"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              if (value === "") return;
              onChangeEmail({ id: email.id, email: value });
              setOpen(false);
            }
            if (event.key === "Escape") {
              setOpen(false);
              onDeleteEmail(email.id);
            }
          }}
        />
      )}
      {hasEmails && (
        <Button
          variant="outline"
          size="icon"
          className="ml-auto shrink-0"
          onClick={() => onDeleteEmail(email.id)}
        >
          <Trash2 size={15} />
        </Button>
      )}
    </CommandItem>
  );
};
