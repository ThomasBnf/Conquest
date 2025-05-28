import { Button } from "@conquest/ui/button";
import { Columns, Rows, Trash2 } from "lucide-react";
import { CSVInfo } from "./schemas/csv-info.schema";

type Props = {
  csvInfo: CSVInfo | null;
  onDelete: () => void;
  setStep: (step: number) => void;
};

export const CSVUploadPreview = ({ csvInfo, onDelete, setStep }: Props) => {
  if (!csvInfo) return null;

  return (
    <div className="flex h-full w-full items-center justify-center rounded-md border">
      <div className="w-full max-w-md space-y-4 rounded-md border bg-surface p-4">
        <div className="flex items-center justify-between">
          <p className="font-medium text-base">{csvInfo.name}</p>
          <Button variant="outline" size="icon" onClick={onDelete}>
            <Trash2 size={16} />
          </Button>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 space-y-2 rounded-md border bg-background p-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Columns size={16} />
              <p>Columns found</p>
            </div>
            <p className="font-medium text-xl">{csvInfo.columns.length}</p>
          </div>
          <div className="flex-1 space-y-2 rounded-md border bg-background p-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Rows size={16} />
              <p>Rows found</p>
            </div>
            <p className="font-medium text-xl">{csvInfo.rows.length}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setStep(2)}>Next</Button>
        </div>
      </div>
    </div>
  );
};
