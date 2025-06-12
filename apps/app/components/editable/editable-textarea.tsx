import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { TextField } from "@conquest/ui/text-field";
import { useState } from "react";
import { CopyButton } from "../custom/copy-button";

type Props = {
  defaultValue: string | null | undefined;
  placeholder: string;
  onUpdate: (value: string) => void;
  copyable?: boolean;
};

export const EditableInput = ({
  defaultValue,
  placeholder,
  onUpdate,
  copyable = true,
}: Props) => {
  const [isFocus, setIsFocus] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const onBlur = (value: string) => {
    onUpdate(value);
    onCancel();
  };

  const onKeyDown = (key: string, value: string) => {
    if (key === "Escape") {
      onCancel();
    }

    if (key === "Enter") {
      onUpdate(value);
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
            " h-8 w-full justify-start border border-transparent",
            !defaultValue && "text-muted-foreground",
          )}
          onClick={() => setIsFocus(true)}
        >
          {!defaultValue || defaultValue === "" ? placeholder : defaultValue}
        </Button>
        {isHover && !isFocus && defaultValue && copyable && (
          <CopyButton value={defaultValue} className="absolute right-1 z-10" />
        )}
      </div>
    );
  }

  return (
    <TextField
      defaultValue={defaultValue ?? ""}
      onBlur={(event) => onBlur(event.target.value)}
      onKeyDown={(event) => onKeyDown(event.key, event.currentTarget.value)}
    />
  );
};
