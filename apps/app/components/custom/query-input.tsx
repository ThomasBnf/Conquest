import { tableParsers } from "@/lib/searchParamsTable";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { Search, X } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

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
  const [_, setParams] = useQueryStates(tableParsers);

  const [isFocus, setIsFocus] = useState(false);
  const [value] = useDebounce(query, 500);
  const ref = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setQuery("");
    setParams({ search: "" });
    ref.current?.focus;
  };

  useEffect(() => {
    setParams({ search: value });
  }, [value]);

  return (
    <div
      className={cn(
        "actions-secondary relative flex w-full max-w-64 items-center rounded-md border pr-1 pl-2",
        isFocus && "border ring-2 ring-ring",
        className,
      )}
    >
      <Search
        size={16}
        className={cn(
          "shrink-0 text-muted-foreground",
          isFocus && "text-main-400",
        )}
      />
      <Input
        ref={ref}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
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
