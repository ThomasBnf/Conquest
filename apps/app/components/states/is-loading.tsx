import { Loader2 } from "lucide-react";

export const IsLoading = () => {
  return (
    <div className="flex h-full items-center justify-center py-40">
      <Loader2 className="size-5 animate-spin text-muted-foreground opacity-70" />
    </div>
  );
};
