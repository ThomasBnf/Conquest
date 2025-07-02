import type { Plans, PlansTable } from "./types";

export const plans: Plans[] = [
  {
    name: "EXPLORER",
    description: "For small communities",
    priceMonthly: 99,
    priceAnnually: 85,
    reduction: 15,
    priceIdMonthly:
      process.env.NODE_ENV === "development"
        ? ["price_1RgSmFCa7sC12ar1vUgVsnY7"]
        : ["price_1RgMHICa7sC12ar1dJ04T3Rx", "price_1R6prFCa7sC12ar17Xqa08mM"],
    priceIdAnnually:
      process.env.NODE_ENV === "development"
        ? ["price_1RgSmUCa7sC12ar16FglI6bx"]
        : ["price_1RgMHeCa7sC12ar10hRpOzFp", "price_1R3eeMCa7sC12ar1KUbWniox"],
    seats: "1 seat",
    members: "Up to 5,000 members",
    integrations: "1 integration",
    api: false,
    popular: false,
  },
  {
    name: "ACTIVE",
    description: "For active communities",
    priceMonthly: 225,
    priceAnnually: 199,
    reduction: 15,
    priceIdMonthly:
      process.env.NODE_ENV === "development"
        ? ["price_1RgSn9Ca7sC12ar1KfhrsPr9"]
        : ["price_1RgMWICa7sC12ar1JYqVONWx", "price_1R6puICa7sC12ar1r0UQH46a"],
    priceIdAnnually:
      process.env.NODE_ENV === "development"
        ? ["price_1RgSnWCa7sC12ar1vo9r95Zv"]
        : ["price_1RgMWhCa7sC12ar1LuuyvAHi", "price_1R3ef2Ca7sC12ar12m2YZcKa"],
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
    priceIdMonthly: ["custom_monthly_priceId"],
    priceIdAnnually: ["custom_annually_priceId"],
    seats: "Custom seats",
    members: "Custom members",
    integrations: "Unlimited & Custom",
    api: true,
    popular: false,
  },
];

export const plansTable: PlansTable[] = [
  {
    name: "EXPLORER",
    priceMonthly: 99,
    priceAnnually: 85,
    reduction: 15,
    seats: 1,
    members: "Up to 5,000",
    integrations: {
      count: 1,
      discord: true,
      discourse: true,
      slack: true,
      github: true,
      api: false,
      livestorm: false,
    },
    workflows: {
      included: "2,500",
      additional: "$0.015 per credit",
    },
    features: {
      memberLevel: true,
      tags: "Unlimited",
      lists: "Unlimited",
      activityTypes: "Unlimited",
      tasks: "Unlimited",
    },
  },
  {
    name: "ACTIVE",
    priceMonthly: 225,
    priceAnnually: 199,
    reduction: 15,
    seats: 2,
    members: "Up to 30,000",
    integrations: {
      count: 3,
      discord: true,
      discourse: true,
      slack: true,
      github: true,
      api: true,
      livestorm: true,
    },
    workflows: {
      included: "10,000",
      additional: "$0.012 per credit",
    },
    features: {
      memberLevel: true,
      tags: "Unlimited",
      lists: "Unlimited",
      activityTypes: "Unlimited",
      tasks: "Unlimited",
    },
  },
  {
    name: "AMBASSADOR",
    priceMonthly: "Custom",
    priceAnnually: "Custom",
    reduction: 15,
    seats: "Custom",
    members: "Custom",
    integrations: {
      count: "Unlimited",
      discord: true,
      discourse: true,
      slack: true,
      github: true,
      api: true,
      livestorm: true,
    },
    workflows: {
      included: "Custom",
      additional: "Custom",
    },
    features: {
      memberLevel: true,
      tags: "Unlimited",
      lists: "Unlimited",
      activityTypes: "Unlimited",
      tasks: "Unlimited",
    },
  },
];
