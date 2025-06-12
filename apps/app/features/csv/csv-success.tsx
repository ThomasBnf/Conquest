import { useWorkspace } from "@/hooks/useWorkspace";
import { Button } from "@conquest/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export const CSVSuccess = () => {
  const { slug } = useWorkspace();

  return (
    <div className="h-full p-4">
      <div className="flex items-center justify-center h-full border rounded-md bg-surface">
        <div className="flex flex-col items-center justify-center max-w-md gap-4 p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center rounded-full size-8 bg-primary/10">
              <Loader2 className="size-4 animate-spin text-primary" />
            </div>
            <p className="text-lg font-medium">Import in progress</p>
          </div>
          <p className="text-muted-foreground">
            We are importing your CSV file. This may take a few minutes. You
            will receive an email when the import is complete.
          </p>
          <Link href={`/${slug}`}>
            <Button>
              <ArrowLeft size={16} />
              Back to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
