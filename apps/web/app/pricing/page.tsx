"use client";

import { MainLayout } from "@/components/MainLayout";
import { PlanPicker } from "@/components/billing/plan-picker";
import { PlansTable } from "@/components/billing/plans-table";
import type { PlanPeriod } from "@/components/billing/types";
import { useState } from "react";

export default function Pricing() {
  const [period, setPeriod] = useState<PlanPeriod>("annually");

  return (
    <MainLayout>
      <section>
        <div className="flex flex-col items-center gap-4 bg-sidebar pt-32 pb-24">
          <div className="flex flex-col items-center gap-4 px-4 text-center">
            <h1 className="max-w-3xl font-bold font-telegraf text-4xl lg:text-6xl">
              Pricing
            </h1>
            <p className="max-w-xl font-suisse text-lg text-muted-foreground">
              Try Conquest for free during 14-day trial. Update your plan
              anytime.
            </p>
          </div>
          <div className="mx-auto mt-24 w-full max-w-5xl px-4">
            <PlanPicker period={period} setPeriod={setPeriod} />
          </div>
        </div>
        <div className="mx-auto w-full max-w-5xl px-4 py-24">
          <PlansTable period={period} setPeriod={setPeriod} />
        </div>
      </section>
    </MainLayout>
  );
}
