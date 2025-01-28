import { Button } from "@conquest/ui/button";
import { Checkbox } from "@conquest/ui/checkbox";
import { Label } from "@conquest/ui/label";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  title: string;
  text: string;
  toCopy?: string;
  value: boolean;
  disabled: boolean;
  onCheckedChange: (value: boolean) => void;
};

export const Instruction = ({
  title,
  text,
  toCopy,
  value,
  disabled,
  onCheckedChange,
}: Props) => {
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = () => {
    if (!toCopy) return;

    setIsCopied(true);
    navigator.clipboard.writeText(toCopy);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-muted-hover p-2">
      <Label>{title}</Label>
      {toCopy && (
        <div className="flex w-fit items-center gap-2 rounded-md border bg-background px-1.5 py-1">
          <p>{toCopy}</p>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={onCopy}
          >
            {isCopied ? (
              <Check size={16} className="text-green-600" />
            ) : (
              <Copy size={16} />
            )}
          </Button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={value}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
        <p>{text}</p>
      </div>
    </div>
  );
};
