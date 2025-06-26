import type { Plan } from "./types";

export const plans = [
  {
    name: "EXPLORER",
    description: "For small communities",
    priceMonthly: 59,
    priceAnnually: 49,
    priceIdMonthly:
      process.env.NODE_ENV === "development"
        ? "price_1R3JRgCa7sC12ar1IGHNN0yF"
        : "price_1R6prFCa7sC12ar17Xqa08mM",
    priceIdAnnually:
      process.env.NODE_ENV === "development"
        ? "price_1R3JRrCa7sC12ar1QDd1Bytj"
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
    priceIdMonthly:
      process.env.NODE_ENV === "development"
        ? "price_1R3JSFCa7sC12ar1rxPAFqGE"
        : "price_1R6puICa7sC12ar1r0UQH46a",
    priceIdAnnually:
      process.env.NODE_ENV === "development"
        ? "price_1R3JSOCa7sC12ar1B7u13ua9"
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

export const plansFeatures: Plan[] = [
  {
    name: "EXPLORER",
    priceMonthly: 59,
    priceAnnually: 49,
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
  // {
  //   name: "CONTRIBUTOR",
  //   priceMonthly: 299,
  //   priceAnnually: 254,
  //   seats: 5,
  //   members: "Up to 100,000",
  //   integrations: {
  //     count: 5,
  //     community: true,
  //     github: true,
  //     api: true,
  //     socials: true,
  //     events: true,
  //   },
  //   features: {
  //     memberLevel: true,
  //     tags: "Unlimited",
  //     lists: "Unlimited",
  //     activityTypes: "Unlimited",
  //   },
  // },
  {
    name: "AMBASSADOR",
    priceMonthly: "Custom",
    priceAnnually: "Custom",
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
