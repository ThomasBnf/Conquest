import { Button, buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CopyButton } from "../custom/copy-button";

type Props = {
  placeholder?: string;
  defaultValue: string | null;
  href?: string | null;
  editable?: boolean;
  redirect?: boolean;
  onUpdate?: (value: string) => void;
  className?: string;
};

export const EditableLink = ({
  defaultValue,
  placeholder,
  href,
  editable = true,
  onUpdate,
  className,
}: Props) => {
  const [value, setValue] = useState(defaultValue);
  const [isFocus, setIsFocus] = useState(false);
  const [isHover, setIsHover] = useState(false);

  const onBlur = (value: string) => {
    setIsHover(false);
    setIsFocus(false);
    onUpdate?.(value);
  };

  const onKeyDown = (key: string) => {
    if (key === "Escape") {
      setIsHover(false);
      setIsFocus(false);
      setValue(defaultValue ?? "");
    }

    if (key === "Enter") {
      setIsHover(false);
      setIsFocus(false);
      onUpdate?.(value ?? "");
    }
  };

  if (!isFocus) {
    return (
      <div
        className="flex flex-1 items-center"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start overflow-hidden",
            !value && "text-muted-foreground",
            className,
          )}
          onClick={() => editable && setIsFocus(true)}
        >
          <span className="truncate">
            {!value || value === "" || value === null ? placeholder : value}
          </span>
        </Button>
        {isHover && value && (
          <div className="absolute right-5 z-10 flex items-center gap-1">
            <CopyButton value={value} />
            <Link
              href={href ?? ""}
              target="_blank"
              className={cn(
                buttonVariants({ variant: "outline", size: "icon_sm" }),
              )}
            >
              <ExternalLink size={16} />
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <Input
      autoFocus
      className="h-8 px-[7px]"
      value={value ?? ""}
      onChange={(event) => setValue(event.target.value)}
      onBlur={(event) => onBlur(event.target.value)}
      onKeyDown={(event) => onKeyDown(event.key)}
    />
  );
};
