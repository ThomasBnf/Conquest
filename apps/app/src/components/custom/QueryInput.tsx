import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { Input } from "@conquest/ui/input";
import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  query: string;
  setQuery: (value: string) => void;
  className?: string;
};

export const QueryInput = ({ query, setQuery, className }: Props) => {
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
        "relative flex w-72 items-center rounded border px-2",
        isFocus && "ring-2 ring-neutral-300 ring-offset-1",
        className,
      )}
    >
      <Search size={18} className="text-muted-foreground" />
      <Input
        ref={ref}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        placeholder="Search"
        variant="transparent"
        className="mr-4 h-8"
      />
      {query && (
        <Button
          onClick={handleClear}
          variant="secondary"
          size="icon"
          className="absolute right-1"
        >
          <X size={14} />
        </Button>
      )}
    </div>
  );
};
