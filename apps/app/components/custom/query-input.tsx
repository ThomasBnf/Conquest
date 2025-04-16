import { tableCompaniesParams, tableMembersParams } from "@/utils/tableParams";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isCompanies = pathname.includes("companies");

  const [_, setParams] = useQueryStates(
    isCompanies ? tableCompaniesParams : tableMembersParams,
  );

  const [isFocus, setIsFocus] = useState(false);
  const [value] = useDebounce(query, 500);
  const ref = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setQuery("");
    setParams({ search: "" });
    ref.current?.focus;
  };

  useEffect(() => {
    if (value) {
      setParams({ search: value });
    }
  }, [value]);

  return (
    <div
      className={cn(
        "actions-secondary relative flex w-full max-w-64 items-center rounded-md border pr-1 pl-2",
        isFocus && "border-main-200 ring-2 ring-ring",
        className,
      )}
    >
      <Search
        size={16}
        className={cn(
          "shrink-0 text-muted-foreground",
          isFocus && "text-main-500",
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
          size="icon_sm"
          className="shrink-0"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
};
