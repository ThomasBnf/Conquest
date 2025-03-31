import { PlanPeriod } from "@/features/billing/types";

type Plan = {
  name: string;
  period: PlanPeriod;
};

export const getSubscriptionDetails = (
  priceId: string | null | undefined,
): Plan | null => {
  if (!priceId) return null;

  switch (priceId) {
    case "price_1R6prFCa7sC12ar17Xqa08mM": {
      return {
        name: "Explorer",
        period: "monthly",
      };
    }
    case "price_1R3eeMCa7sC12ar1KUbWniox": {
      return {
        name: "Explorer",
        period: "annually",
      };
    }
    case "price_1R6puICa7sC12ar1r0UQH46a": {
      return {
        name: "Active",
        period: "monthly",
      };
    }
    case "price_1R3ef2Ca7sC12ar12m2YZcKa": {
      return {
        name: "Active",
        period: "annually",
      };
    }

    // DEVELOPMENT

    case "price_1R3JRgCa7sC12ar1IGHNN0yF": {
      return {
        name: "Explorer",
        period: "monthly",
      };
    }
    case "price_1R3JRrCa7sC12ar1QDd1Bytj": {
      return {
        name: "Explorer",
        period: "annually",
      };
    }
    case "price_1R3JSFCa7sC12ar1rxPAFqGE": {
      return {
        name: "Active",
        period: "monthly",
      };
    }
    case "price_1R3JSOCa7sC12ar1B7u13ua9": {
      return {
        name: "Active",
        period: "annually",
      };
    }

    default: {
      return null;
    }
  }
};
