import { cn } from "../../../../packages/ui/src/lib/utils";
import { Loader2 } from "lucide-react";
type Props = {
  isAbsolute?: boolean;
};

export const IsLoading = ({ isAbsolute = false }: Props) => {
  return (
    <div
      className={cn(
        "flex h-full items-center justify-center gap-2 py-24",
        isAbsolute && "absolute inset-0",
      )}
    >
      <Loader2 className="animate-spin text-muted-foreground" size={16} />
      <p>Loading...</p>
    </div>
  );
};
