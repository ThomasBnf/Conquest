import { Info } from "lucide-react";

export const LoadingMessage = () => (
  <div className="actions-secondary mt-6 rounded-md border p-4">
    <Info size={18} className="text-muted-foreground" />
    <p className="mt-2 mb-1 font-medium">Collecting data</p>
    <p className="text-muted-foreground">
      This may take a few minutes.
      <br />
      You can leave this page while we collect your data.
      <br />
      Do not hesitate to refresh the page to see data changes.
    </p>
  </div>
);
