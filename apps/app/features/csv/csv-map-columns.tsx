import { trpc } from "@/server/client";
import { Badge } from "@conquest/ui/badge";
import { Button } from "@conquest/ui/button";
import { cn } from "@conquest/ui/cn";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { AttributesPicker } from "./attributes-picker";
import { CSVInfo } from "./schemas/csv-info.schema";

type Props = {
  csvInfo: CSVInfo | null;
  onDelete: () => void;
  setStep: (step: number) => void;
};

export const CSVMapColumns = ({ csvInfo, onDelete, setStep }: Props) => {
  const [hover, setHover] = useState<string | null>(null);
  const [mappedColumns, setMappedColumns] = useState<Record<string, string>>(
    {},
  );

  console.log(mappedColumns);

  const { mutateAsync } = trpc.csv.import.useMutation();

  const onMapColumn = (column: string, attribute: string) => {
    setMappedColumns((prev) => ({ ...prev, [column]: attribute }));
  };

  const onClearColumn = (column: string) => {
    setMappedColumns((prev) => {
      const { [column]: _, ...rest } = prev;
      return rest;
    });
  };

  const onImport = () => {
    if (!csvInfo) return;

    mutateAsync({ csvInfo, mappedColumns });
  };

  const { isValid, errors } = useMemo(() => {
    const mappedValues = Object.values(mappedColumns);
    const hasDiscordUsername = mappedValues.includes("discordUsername");
    const hasDiscordId = mappedValues.includes("discordId");

    const hasDiscourseId = mappedValues.includes("discourseId");
    const hasDiscourseUsername = mappedValues.includes("discourseUsername");

    const hasGithubId = mappedValues.includes("githubId");
    const hasGithubLogin = mappedValues.includes("githubLogin");

    const hasLivestormId = mappedValues.includes("livestormId");
    const hasLivestormUsername = mappedValues.includes("livestormUsername");

    const hasSlackId = mappedValues.includes("slackId");
    const hasSlackRealName = mappedValues.includes("slackRealName");

    const validationErrors = [];

    if (hasDiscordUsername && !hasDiscordId) {
      validationErrors.push("Discord Username requires Discord ID");
    }

    if (hasDiscourseUsername && !hasDiscourseId) {
      validationErrors.push("Discourse Username requires Discourse ID");
    }

    if (hasGithubLogin && !hasGithubId) {
      validationErrors.push("GitHub Login requires GitHub ID");
    }

    if (hasLivestormUsername && !hasLivestormId) {
      validationErrors.push("Livestorm Username requires Livestorm ID");
    }

    if (hasSlackRealName && !hasSlackId) {
      validationErrors.push("Slack Username requires Slack ID");
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
    };
  }, [mappedColumns]);

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
                    onClear={() => onClearColumn(header)}
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

      {errors.length > 0 && (
        <div className="p-4">
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600 shadow-sm">
            <div className="flex items-center gap-2">
              <p>⚠️</p>
              <p className="font-medium">
                Please fix the following issues before importing
              </p>
            </div>
            <div className="mt-2 space-y-1 pl-6">
              {errors.map((error, index) => (
                <p key={index}>- {error}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex h-12 shrink-0 items-center justify-end gap-2 px-4">
        <Button variant="outline" onClick={onDelete}>
          Cancel
        </Button>
        <Button onClick={onImport} disabled={!isValid}>
          Import
        </Button>
      </div>
    </div>
  );
};
