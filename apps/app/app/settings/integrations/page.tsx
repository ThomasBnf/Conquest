"use client";

import { categories } from "@/features/integrations/constant";
import { IntegrationCard } from "@/features/integrations/integration-card";
import { ScrollArea } from "@conquest/ui/scroll-area";

export default function Page() {
  return (
    <ScrollArea className="h-dvh">
      <div className="mx-auto flex max-w-4xl flex-col px-4 py-12 lg:py-24">
        <p className="font-medium text-2xl">Integrations</p>
        <p className="text-muted-foreground">
          Synchronize data across platforms
        </p>
        {categories.map((category) => (
          <div key={category.label}>
            <p className="mt-4 mb-2 font-medium text-base">{category.label}</p>
            <div className="grid grid-cols-2 gap-4">
              {category.integrations.map((integration) => (
                <IntegrationCard
                  key={integration.name}
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
