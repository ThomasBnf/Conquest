import type { Plan, PlanTable } from "./types";

export const plans: Plan[] = [
  {
    name: "EXPLORER",
    description: "For small communities",
    priceMonthly: 59,
    priceAnnually: 49,
    reduction: 15,
    priceIdMonthly:
      process.env.NODE_ENV === "development"
        ? "price_1Rc5eDCa7sC12ar1NU49CVxk"
        : "price_1R6prFCa7sC12ar17Xqa08mM",
    priceIdAnnually:
      process.env.NODE_ENV === "development"
        ? "price_1Rc5evCa7sC12ar1uznFR0QO"
        : "price_1R3eeMCa7sC12ar1KUbWniox",
    seats: "1 seat",
    members: "Up to 5,000 members",
    integrations: "1 integration",
    api: true,
    popular: false,
  },
  {
    name: "ACTIVE",
    description: "For active communities",
    priceMonthly: 99,
    priceAnnually: 85,
    reduction: 15,
    priceIdMonthly:
      process.env.NODE_ENV === "development"
        ? "price_1Rc5fuCa7sC12ar1lUTIuAAv"
        : "price_1R6puICa7sC12ar1r0UQH46a",
    priceIdAnnually:
      process.env.NODE_ENV === "development"
        ? "price_1Rc5gRCa7sC12ar1UHb8VBOv"
        : "price_1R3ef2Ca7sC12ar12m2YZcKa",
    seats: "2 seats",
    members: "Up to 30,000 members",
    integrations: "3 integrations",
    api: true,
    popular: true,
  },
  {
    name: "AMBASSADOR",
    description: "For large communities",
    priceMonthly: "Custom",
    priceAnnually: "Custom",
    priceIdMonthly: "custom_monthly_priceId",
    priceIdAnnually: "custom_annually_priceId",
    seats: "Custom seats",
    members: "Custom members",
    integrations: "Unlimited & Custom",
    api: true,
    popular: false,
  },
];

export const plansTable: PlanTable[] = [
  {
    name: "EXPLORER",
    priceMonthly: 59,
    priceAnnually: 49,
    reduction: 15,
    seats: 1,
    members: "Up to 5,000",
    integrations: {
      count: 1,
      community: true,
      github: true,
      api: true,
      socials: false,
      events: false,
    },
    features: {
      memberLevel: true,
      tags: "Unlimited",
      lists: "Unlimited",
      activityTypes: "Unlimited",
    },
  },
  {
    name: "ACTIVE",
    priceMonthly: 99,
    priceAnnually: 85,
    reduction: 15,
    seats: 2,
    members: "Up to 30,000",
    integrations: {
      count: 3,
      community: true,
      github: true,
      api: true,
      socials: true,
      events: true,
    },
    features: {
      memberLevel: true,
      tags: "Unlimited",
      lists: "Unlimited",
      activityTypes: "Unlimited",
    },
  },
  {
    name: "AMBASSADOR",
    priceMonthly: "Custom",
    priceAnnually: "Custom",
    reduction: null,
    seats: "Custom",
    members: "Custom",
    integrations: {
      count: "Unlimited",
      community: true,
      github: true,
      api: true,
      socials: true,
      events: true,
    },
    features: {
      memberLevel: true,
      tags: "Unlimited",
      lists: "Unlimited",
      activityTypes: "Unlimited",
    },
  },
];
