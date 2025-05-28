import Link from "next/link";

export const CSVImport = () => {
  return (
    <Link
      href="/settings/integrations/csv"
      className="flex items-start gap-4 rounded-md border p-4 transition-colors hover:bg-muted"
    >
      <p className="font-medium text-lg leading-tight">CSV</p>
      <p className="text-muted-foreground">
        Import your existing data from a CSV file
      </p>
    </Link>
  );
};
