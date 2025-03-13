"use client";

import { cn } from "@conquest/ui/cn";
import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { Inter } from "next/font/google";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("h-dvh overflow-hidden", inter.className)}>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
