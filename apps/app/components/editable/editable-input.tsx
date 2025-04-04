import { buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { useState } from "react";
import { CopyButton } from "../custom/copy-button";

type Props = {
  defaultValue: string | null;
  placeholder?: string;
  onUpdate: (value: string) => void;
  className?: string;
};

export const EditableInput = ({
  defaultValue,
  placeholder,
  onUpdate,
  className,
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
      setIsFocus(false);
      setValue(defaultValue ?? "");
    }

    if (key === "Enter") {
      onUpdate(value ?? "");
      setIsFocus(false);
    }
  };

  if (!isFocus) {
    return (
      <div
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "relative w-full cursor-pointer justify-start border border-transparent",
          !value && "text-muted-foreground",
          className,
        )}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={() => setIsFocus(true)}
      >
        <span className="truncate">
          {value === "" || value === null ? placeholder : value}
        </span>
        {isHover && !isFocus && value && (
          <CopyButton value={value} className="absolute right-1" />
        )}
      </div>
    );
  }

  return (
    <Input
      autoFocus
      className="h-8 flex-1"
      value={value ?? ""}
      onChange={(event) => setValue(event.target.value)}
      onBlur={(event) => onBlur(event.target.value)}
      onKeyDown={(event) => onKeyDown(event.key)}
    />
  );
};
