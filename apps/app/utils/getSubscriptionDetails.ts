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

    case "price_1Rc5eDCa7sC12ar1NU49CVxk": {
      return {
        name: "Explorer",
        period: "monthly",
      };
    }
    case "price_1Rc5evCa7sC12ar1uznFR0QO": {
      return {
        name: "Explorer",
        period: "annually",
      };
    }
    case "price_1Rc5fuCa7sC12ar1lUTIuAAv": {
      return {
        name: "Active",
        period: "monthly",
      };
    }
    case "price_1Rc5gRCa7sC12ar1UHb8VBOv": {
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
