import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { AttributesPicker } from "./attributes-picker";
import { CSVInfo } from "./schemas/csv-info.schema";

type Props = {
  csvInfo: CSVInfo | null;
  setStep: (step: number) => void;
};

export const CSVMapColumns = ({ csvInfo, setStep }: Props) => {
  const [hover, setHover] = useState<string | null>(null);
  const [mappedColumns, setMappedColumns] = useState<{
    [key: string]: string;
  }>({});

  const { mutateAsync } = trpc.csv.import.useMutation();

  const onMapColumn = (column: string, attribute: string) => {
    setMappedColumns((prev) => ({ ...prev, [column]: attribute }));
  };

  console.log(mappedColumns);

  const onImport = () => {
    if (!csvInfo) return;

    mutateAsync({ csvInfo, mappedColumns });
  };

  return (
    <div className="flex h-full flex-col divide-y">
      <div className="flex h-full divide-x">
        <div className="flex-1 divide-y">
          <div className="flex h-10 shrink-0 items-center bg-surface px-4 text-muted-foreground">
            <p className="flex-1">Column</p>
            <div className="flex-1" />
            <p className="flex-1">Attributes</p>
          </div>
          <div className="flex flex-col divide-y">
            {csvInfo?.headers.map((header) => (
              <div
                key={header}
                onMouseEnter={() => setHover(header)}
                className={cn("flex h-12 items-center px-4", {
                  "bg-surface": hover === header,
                })}
              >
                <p className="flex-1">{header}</p>
                <div className="flex-1">
                  <ArrowRight size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <AttributesPicker
                    value={mappedColumns[header]}
                    onValueChange={(attribute) =>
                      onMapColumn(header, attribute)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-md flex-1 divide-y">
          <div className="flex h-10 shrink-0 items-center justify-between bg-surface px-4">
            <p className="font-medium">{hover}</p>
            <Badge variant="outline">Data Preview</Badge>
          </div>
          {hover &&
            csvInfo?.rows.slice(0, 10).map((row, index) => (
              <div key={index} className="border-b px-4 py-2">
                <p>{row[hover]?.toString() || "-"}</p>
              </div>
            ))}
          <div className="flex justify-center">
            <p className="px-4 py-2 text-muted-foreground text-xs">
              This preview shows 10 rows of the column values
            </p>
          </div>
        </div>
      </div>
      <div className="flex h-12 shrink-0 items-center justify-end px-4">
        <Button onClick={onImport}>Import</Button>
      </div>
    </div>
  );
};
