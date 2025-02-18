"use client";

import { trpc } from "@/server/client";
import { env } from "@conquest/env";
import { TooltipProvider } from "@conquest/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { httpBatchLink } from "@trpc/client";
import { type ReactNode, useState } from "react";
import { Toaster } from "sonner";
import superjson from "superjson";

type Props = {
  children: ReactNode;
};

export const Providers = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${env.NEXT_PUBLIC_BASE_URL}/api/trpc`,
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Toaster position="bottom-right" closeButton duration={3500} />
        <TooltipProvider>{children}</TooltipProvider>
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-left"
          />
        )}
      </QueryClientProvider>
    </trpc.Provider>
  );
};
