"use client";

import { trpc } from "@/server/client";
import { env } from "@conquest/env";
import { TooltipProvider } from "@conquest/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpLink } from "@trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";
import superjson from "superjson";

type Props = {
  children: ReactNode;
};

export const Providers = ({ children }: Props) => {
  const [isClient, setIsClient] = useState(false);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: false,
          },
        },
      }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpLink({
          url: `${env.NEXT_PUBLIC_URL}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Toaster position="bottom-right" closeButton duration={3500} />
        <TooltipProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </TooltipProvider>
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-right"
          />
        )}
      </QueryClientProvider>
    </trpc.Provider>
  );
};
