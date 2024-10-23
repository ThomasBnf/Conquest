import { Button } from "@conquest/ui/button";
import { Input } from "@conquest/ui/input";
import { cn } from "@conquest/ui/utils/cn";
import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  query: string;
  setQuery: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export const QueryInput = ({
  query,
  setQuery,
  placeholder = "Search",
  className,
}: Props) => {
  const [isFocus, setIsFocus] = useState(false);
  const [value, setValue] = useState(query);
  const ref = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setQuery(newValue);
  };

  const handleClear = () => {
    setValue("");
    setQuery("");
    ref.current?.focus();
  };

  return (
    <div
      className={cn(
        "relative flex w-56 items-center rounded border px-2 shadow-sm",
        isFocus && "ring-2 ring-neutral-200 ring-offset-1",
        className,
      )}
    >
      <Search size={15} className="text-muted-foreground shrink-0" />
      <Input
        ref={ref}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        placeholder={placeholder}
        variant="transparent"
        className="h-8"
      />
      {query && (
        <Button
          onClick={handleClear}
          variant="secondary"
          size="icon"
          className="shrink-0"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
};
