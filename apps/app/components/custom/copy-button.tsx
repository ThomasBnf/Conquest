import { Button } from "@conquest/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  value: string;
  className?: string;
};

export const CopyButton = ({ value, className }: Props) => {
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setIsCopied(true);
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon_sm"
      onClick={(e) => onCopy(e)}
      className={className}
    >
      {isCopied ? (
        <Check size={15} className="text-green-600" />
      ) : (
        <Copy size={14} />
      )}
    </Button>
  );
};
