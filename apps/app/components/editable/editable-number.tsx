import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { useState } from "react";
import { CopyButton } from "../custom/copy-button";

type Props = {
  defaultValue: number | null;
  placeholder: string;
  onUpdate: (value: number | null) => void;
  copyable?: boolean;
};

export const EditableNumber = ({
  defaultValue,
  placeholder,
  onUpdate,
  copyable = true,
}: Props) => {
  const [isFocus, setIsFocus] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const onBlur = (value: string) => {
    console.log("onBlur", value);
    onUpdate(value ? Number(value) : null);
    onCancel();
  };

  const onKeyDown = (key: string, value: string) => {
    if (key === "Escape") {
      onCancel();
    }

    if (key === "Enter") {
      onUpdate(value ? Number(value) : null);
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
        className="-ml-[9px] relative flex items-center"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <Button
          variant="ghost"
          className={cn(
            "h-8 w-full justify-start border border-transparent",
            !defaultValue && "text-muted-foreground",
          )}
          onClick={() => setIsFocus(true)}
        >
          {defaultValue === null ? placeholder : defaultValue}
        </Button>
        {isHover && !isFocus && copyable && (
          <CopyButton
            value={defaultValue?.toString() ?? ""}
            className="absolute right-1 z-10"
          />
        )}
      </div>
    );
  }

  return (
    <Input
      autoFocus
      type="number"
      defaultValue={defaultValue ?? ""}
      onKeyDown={(event) => onKeyDown(event.key, event.currentTarget.value)}
      onBlur={(event) => onBlur(event.currentTarget.value)}
      className="h-8"
    />
  );
};
