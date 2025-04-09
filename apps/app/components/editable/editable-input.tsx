import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { useState } from "react";
import { CopyButton } from "../custom/copy-button";

type Props = {
  defaultValue: string | null;
  placeholder?: string;
  onUpdate: (value: string) => void;
};

export const EditableInput = ({
  defaultValue,
  placeholder,
  onUpdate,
}: Props) => {
  const [value, setValue] = useState(defaultValue);
  const [isFocus, setIsFocus] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const onBlur = (value: string) => {
    onUpdate(value);
    setIsFocus(false);
  };

  const onKeyDown = (key: string) => {
    if (key === "Escape") {
      setValue(defaultValue ?? "");
      onCancel();
    }

    if (key === "Enter") {
      onUpdate(value ?? "");
      onCancel();
    }
  };

  const onCancel = () => {
    setIsFocus(false);
    setIsHover(false);
  };

  if (!isFocus) {
    return (
      <div
        className="relative flex items-center"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <Button
          variant="ghost"
          className={cn(
            "h-8 w-full justify-start border border-transparent",
            !value && "text-muted-foreground",
          )}
          onClick={() => setIsFocus(true)}
        >
          {value === "" || value === null ? placeholder : value}
        </Button>
        {isHover && !isFocus && value && (
          <CopyButton value={value} className="absolute right-1 z-10" />
        )}
      </div>
    );
  }

  return (
    <Input
      autoFocus
      value={value ?? ""}
      onChange={(event) => setValue(event.target.value)}
      onBlur={(event) => {
        onBlur(event.target.value);
        onCancel();
      }}
      onKeyDown={(event) => onKeyDown(event.key)}
    />
  );
};
