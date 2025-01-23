import { Button, buttonVariants } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Props = {
  placeholder?: string;
  defaultValue: string | null;
  href?: string | null;
  editable?: boolean;
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
    if (key === "Enter") {
      setIsHover(false);
      setIsFocus(false);
      onUpdate?.(value ?? "");
    }
  };

  if (!isFocus) {
    return (
      <div
        className="flex w-full items-center truncate"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <Button
          variant="ghost"
          className={cn(
            "w-full overflow-hidden text-muted-foreground",
            !editable && "hover:bg-transparent hover:text-muted-foreground",
            className,
          )}
          classNameSpan={cn("justify-start", value && "text-foreground")}
          onClick={() => editable && setIsFocus(true)}
        >
          <span className="truncate">
            {value === "" || value === null ? placeholder : value}
          </span>
        </Button>

        {isHover && value && (
          <Link
            href={href ?? ""}
            target="_blank"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "-ml-7 z-10",
            )}
          >
            <ExternalLink size={15} />
          </Link>
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
