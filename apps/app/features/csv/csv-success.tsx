import { useGetSlug } from "@/hooks/useGetSlug";
import { Button } from "@conquest/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export const CSVSuccess = () => {
  const slug = useGetSlug();

  return (
    <div className="h-full p-4">
      <div className="flex h-full items-center justify-center rounded-md border bg-surface">
        <div className="flex max-w-md flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="size-4 animate-spin text-primary" />
            </div>
            <p className="font-medium text-lg">Import in progress</p>
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
