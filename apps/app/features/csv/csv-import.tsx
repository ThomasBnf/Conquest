import { Import } from "lucide-react";
import Link from "next/link";

export const CSVImport = () => {
  return (
    <Link
      href="/settings/integrations/csv"
      className="mt-4 flex gap-4 rounded-md border p-4 transition-colors hover:bg-muted"
    >
      <Import size={24} />
      <div>
        <p className="font-medium text-lg leading-tight">CSV</p>
        <p className="text-muted-foreground">
          Import your existing data from a CSV file
        </p>
      </div>
    </Link>
  );
};
