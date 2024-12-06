import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    setValue(query);
  }, [query]);

  return (
    <div
      className={cn(
        "actions-secondary relative flex w-full max-w-64 items-center rounded-md border px-2",
        isFocus && "border-main-400 ring-2 ring-ring",
        className,
      )}
    >
      <Search
        size={15}
        className={cn(
          "shrink-0 text-muted-foreground",
          isFocus && "text-main-500",
        )}
      />
      <Input
        ref={ref}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        placeholder={placeholder}
        variant="transparent"
        className="h-[30px]"
      />
      {query && (
        <Button
          onClick={handleClear}
          variant="outline"
          size="icon"
          className="shrink-0"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
};
