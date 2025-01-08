"use client";

import { TooltipProvider } from "@conquest/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/react";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

type Props = {
  children: ReactNode;
};

export const Providers = ({ children }: Props) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right" closeButton duration={3500} />
      <TooltipProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
