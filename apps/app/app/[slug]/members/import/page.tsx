"use client";

import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/custom/drop-zone";
import { Header } from "@/components/layouts/header";
import { PageLayout } from "@/components/layouts/page-layout";
import { CSVMapColumns } from "@/features/csv/csv-map-columns";
import { CSVSteps } from "@/features/csv/csv-steps";
import { CSVSuccess } from "@/features/csv/csv-success";
import { CSVUploadPreview } from "@/features/csv/csv-upload-preview";
import { parse } from "papaparse";
import { useState } from "react";

export default function Page() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[] | undefined>();
  const [csvInfo, setCsvInfo] = useState<{
    name: string;
    rows: Record<string, unknown>[];
    columns: string[];
    headers: string[];
  } | null>(null);

  const onDrop = (files: File[]) => {
    setFiles(files);

    const file = files[0];

    parse(file!, {
      header: true,
      complete: (results) => {
        const data = results.data as Record<string, unknown>[];
        const headers = results.meta.fields || [];

        setCsvInfo({
          name: file!.name,
          rows: data.filter((row) =>
            Object.values(row).some((value) => value !== ""),
          ),
          columns: headers,
          headers: headers,
        });
      },
    });
  };

  const onDelete = () => {
    setFiles([]);
    setCsvInfo(null);
    setStep(1);
  };

  return (
    <PageLayout>
      <Header title="Import CSV" />
      <CSVSteps step={step} />
      {step === 1 && (
        <div className="h-full p-4">
          {files?.length ? (
            <CSVUploadPreview
              csvInfo={csvInfo}
              onDelete={onDelete}
              setStep={setStep}
            />
          ) : (
            <Dropzone
              maxSize={1024 * 1024 * 10}
              maxFiles={1}
              accept={{ "text/csv": [] }}
              onDrop={onDrop}
              src={files}
              onError={console.error}
              className="h-full"
            >
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
          )}
        </div>
      )}
      {step === 2 && (
        <CSVMapColumns
          csvInfo={csvInfo}
          onDelete={onDelete}
          setStep={setStep}
        />
      )}
      {step === 3 && <CSVSuccess />}
    </PageLayout>
  );
}
