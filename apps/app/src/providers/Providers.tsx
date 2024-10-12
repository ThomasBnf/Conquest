"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

type Props = {
  children: ReactNode;
};

export const Providers = ({ children }: Props) => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right" closeButton duration={3500} />
      {children}
    </QueryClientProvider>
  );
};
