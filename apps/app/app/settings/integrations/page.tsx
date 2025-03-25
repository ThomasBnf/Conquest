"use client";

import { IntegrationCard } from "@/features/integrations/integration-card";
import { categories } from "@/features/integrations/integrations";
import { trpc } from "@/server/client";
import { Button } from "@conquest/ui/button";
import { ScrollArea } from "@conquest/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Page() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);

  const { mutate: seed } = trpc.db.seed.useMutation({
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      setLoading(false);
    },
  });

  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 lg:py-24">
        <p className="font-medium text-2xl">Integrations</p>
        <p className="text-muted-foreground">
          Synchronize data across platforms
        </p>
        {session?.user.role === "STAFF" && (
          <Button
            disabled={loading}
            onClick={() => seed()}
            className="mt-4 w-fit"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Seed dabatase"
            )}
          </Button>
        )}
        {categories.map((category) => (
          <div key={category.label}>
            <p className="mt-4 mb-2 font-medium text-base">{category.label}</p>
            <div className="grid grid-cols-2 gap-4">
              {category.integrations.map((integration) => (
                <IntegrationCard
                  key={integration.source}
                  integration={integration}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
