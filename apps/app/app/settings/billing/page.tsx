"use client";

import { BillingPage } from "@/features/billing/billing-page";
import { PlansTable } from "@/features/billing/plans-table";
import type { PlanPeriod } from "@/features/billing/types";
import { useState } from "react";

export default function Page() {
  const [period, setPeriod] = useState<PlanPeriod>("annually");

  return (
    <BillingPage
      title="Billing"
      description="Update your payment information or switch plans according to your needs"
    >
      <PlansTable period={period} setPeriod={setPeriod} />
    </BillingPage>
  );
}
