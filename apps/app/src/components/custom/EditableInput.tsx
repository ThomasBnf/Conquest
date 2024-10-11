import { Icon } from "@/components/icons/Icon";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { TextField } from "@conquest/ui/text-field";
import type { icons } from "lucide-react";
import { useState } from "react";

type Props = {
  icon: keyof typeof icons;
  defaultValue: string | null;
  placeholder?: string;
  onUpdate: (value: string) => void;
  textArea?: boolean;
};

export const EditableInput = ({
  icon,
  defaultValue,
  placeholder,
  onUpdate,
  textArea,
}: Props) => {
  const [value, setValue] = useState(defaultValue);
  const [isFocus, setIsFocus] = useState(false);

  if (!isFocus) {
    return (
      <div className="flex min-h-7 items-center gap-1.5">
        <Icon
          name={icon}
          size={15}
          className="shrink-0 text-muted-foreground"
        />
        <Button onClick={() => setIsFocus(true)} variant="ghost" size="xs">
          {value ? (
            value
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-fit gap-2",
        textArea ? "items-start" : "items-center",
      )}
    >
      <Icon name={icon} size={15} className="shrink-0 text-muted-foreground" />
      {textArea ? (
        <TextField
          autoFocus
          className="h-8"
          rows={3}
          value={value ?? ""}
          onChange={(event) => setValue(event.target.value)}
          onBlur={(event) => {
            onUpdate(event.target.value);
            setIsFocus(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onUpdate(value ?? "");
              setIsFocus(false);
            }
          }}
        />
      ) : (
        <Input
          autoFocus
          className="h-7 px-[3px]"
          value={value ?? ""}
          onChange={(event) => setValue(event.target.value)}
          onBlur={(event) => {
            onUpdate(event.target.value);
            setIsFocus(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onUpdate(value ?? "");
              setIsFocus(false);
            }
          }}
        />
      )}
    </div>
  );
};
