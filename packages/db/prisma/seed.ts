import { prisma } from "@conquest/db/prisma";
import { ActivityTypeSchema } from "@conquest/zod/schemas/activity-type.schema";
import {
  type Activity,
  type ActivityWithType,
  ActivityWithTypeSchema,
} from "@conquest/zod/schemas/activity.schema";
import {
  type Log,
  type Member,
  MemberSchema,
} from "@conquest/zod/schemas/member.schema";
import { WorkspaceSchema } from "@conquest/zod/schemas/workspace.schema";
import { faker } from "@faker-js/faker";
import { getLocaleByAlpha2 } from "country-locale-map";
import {
  eachWeekOfInterval,
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  isAfter,
  isBefore,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  subDays,
  subMonths,
  subQuarters,
  subWeeks,
} from "date-fns";

const EUROPEAN_COUNTRIES = [
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
];

async function main() {
  const workspace = WorkspaceSchema.parse(await prisma.workspaces.findFirst());

  const activities_types = ActivityTypeSchema.array().parse(
    await Promise.all(
      [
        {
          name: "Invite",
          source: "DISCOURSE" as const,
          key: "discourse:invite",
          weight: 7,
          channels: [],
          deletable: false,
          workspace_id: workspace.id,
        },
        {
          name: "Post marked as solved",
          source: "DISCOURSE" as const,
          key: "discourse:solved",
          weight: 7,
          deletable: false,
          workspace_id: workspace.id,
        },
        {
          name: "Write a topic",
          source: "DISCOURSE" as const,
          key: "discourse:topic",
          weight: 6,
          deletable: false,
          workspace_id: workspace.id,
        },
        {
          name: "Reply to topic",
          source: "DISCOURSE" as const,
          key: "discourse:reply",
          weight: 5,
          deletable: false,
          workspace_id: workspace.id,
        },
        {
          name: "Join Discourse community",
          source: "DISCOURSE" as const,
          key: "discourse:join",
          weight: 4,
          deletable: false,
          workspace_id: workspace.id,
        },
        {
          name: "Login",
          source: "DISCOURSE" as const,
          key: "discourse:login",
          weight: 0,
          deletable: false,
          workspace_id: workspace.id,
        },
        {
          name: "Add reaction",
          source: "DISCOURSE" as const,
          key: "discourse:reaction",
          weight: 0,
          deletable: false,
          workspace_id: workspace.id,
        },
      ].map((data) => prisma.activities_types.create({ data })),
    ),
  );

  const members = Array.from({ length: 3253 }, () => {
    const id = faker.string.uuid();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const country = faker.helpers.arrayElement(EUROPEAN_COUNTRIES);
    const locale = getLocaleByAlpha2(country);

    const createdAt = faker.date.between({
      from: "2024-01-01",
      to: new Date(),
    });

    return {
      external_id: id,
      discourse_id: faker.string.uuid(),
      discourse_username: `${firstName.toLowerCase()}${lastName.toLowerCase()}_${id}`,
      first_name: firstName,
      last_name: lastName,
      primary_email: faker.internet
        .email({ firstName, lastName })
        .toLowerCase(),
      phones: [faker.phone.number({ style: "international" })],
      job_title: faker.person.jobTitle(),
      avatar_url: faker.image.avatar(),
      locale,
      source: "DISCOURSE" as const,
      workspace_id: workspace.id,
      created_at: createdAt,
      updated_at: createdAt,
    };
  });

  await prisma.members.createMany({ data: members });

  const createdMembers = MemberSchema.array().parse(
    await prisma.members.findMany({
      where: {
        workspace_id: workspace.id,
      },
    }),
  );

  const activities = createdMembers.flatMap((member) => {
    const numActivities = faker.helpers.weightedArrayElement([
      { weight: 5, value: faker.number.int({ min: 20, max: 100 }) },
      { weight: 5, value: faker.number.int({ min: 10, max: 20 }) },
      { weight: 20, value: faker.number.int({ min: 0, max: 10 }) },
      { weight: 70, value: faker.number.int(0) },
    ]);

    return Array.from({ length: numActivities }, () => {
      const activityType = faker.helpers.weightedArrayElement([
        {
          weight: 8,
          value: "discourse:login",
        },
        {
          weight: 1,
          value: "discourse:solved",
        },
        {
          weight: 1,
          value: "discourse:invite",
        },
        {
          weight: 10,
          value: "discourse:reply",
        },
        {
          weight: 40,
          value: "discourse:reaction",
        },
        {
          weight: 40,
          value: "discourse:topic",
        },
      ]);

      const activity_type = activities_types.find(
        (activity_type) => activity_type.key === activityType,
      );

      const createdAt = faker.date.between({
        from: member.created_at,
        to: new Date(),
      });

      return {
        external_id: faker.string.uuid(),
        title:
          activity_type?.key === "discourse:topic"
            ? faker.lorem.sentence()
            : null,
        message:
          activity_type?.key === "discourse:reaction"
            ? "like"
            : faker.lorem.paragraph(),
        activity_type_id: activity_type?.id ?? "",
        member_id: member.id,
        workspace_id: workspace.id,
        created_at: createdAt,
        updated_at: createdAt,
      };
    });
  });

  await prisma.activities.createMany({ data: activities });

  for (const member of createdMembers) {
    await calculateMemberMetrics(member);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

const getFirstActivity = async (member: Member) => {
  const { id, workspace_id } = member;

  const firstActivity = await prisma.activities.findFirst({
    where: {
      member_id: id,
      workspace_id,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  return firstActivity;
};

const listActivitiesIn365Days = async (member: Member) => {
  const today = new Date();
  const last365Days = startOfDay(subDays(today, 365));

  const { id, workspace_id } = member;

  const activities = await prisma.activities.findMany({
    where: {
      member_id: id,
      workspace_id,
      created_at: {
        gte: last365Days,
        lte: endOfDay(today),
      },
      activity_type: {
        weight: {
          gt: 0,
        },
      },
    },
    include: {
      activity_type: true,
    },
    orderBy: {
      created_at: "asc",
    },
  });

  return ActivityWithTypeSchema.array().parse(activities);
};

const getMemberPresence = (
  activities: Activity[],
  currentDate: Date,
): number => {
  const activitiesDates = activities.map((activity) =>
    startOfDay(new Date(activity.created_at)),
  );

  const intervals = calculateIntervals(currentDate);

  const counts: PresenceCounts = {
    daysInPreviousWeek: countActivitiesInInterval(
      activitiesDates,
      intervals.week,
    ),
    daysInPrevious2Weeks: countActivitiesInInterval(
      activitiesDates,
      intervals.week2,
    ),
    daysInPrevious3Weeks: countActivitiesInInterval(
      activitiesDates,
      intervals.week3,
    ),
    daysInPreviousMonth: countActivitiesInInterval(
      activitiesDates,
      intervals.month,
    ),
    daysInPrevious2Months: countActivitiesInInterval(
      activitiesDates,
      intervals.month2,
    ),
    daysInPrevious3Months: countActivitiesInInterval(
      activitiesDates,
      intervals.month3,
    ),
    daysInPreviousQuarter: countActivitiesInInterval(
      activitiesDates,
      intervals.quarter,
    ),
    daysInPrevious2Quarters: countActivitiesInInterval(
      activitiesDates,
      intervals.quarter2,
    ),
    daysInPrevious3Quarters: countActivitiesInInterval(
      activitiesDates,
      intervals.quarter3,
    ),
  };

  return getMemberLevel(counts);
};

type PresenceCounts = {
  daysInPreviousWeek: number;
  daysInPrevious2Weeks: number;
  daysInPrevious3Weeks: number;
  daysInPreviousMonth: number;
  daysInPrevious2Months: number;
  daysInPrevious3Months: number;
  daysInPreviousQuarter: number;
  daysInPrevious2Quarters: number;
  daysInPrevious3Quarters: number;
};

type TimeInterval = {
  start: Date;
  end: Date;
};

const THRESHOLDS = {
  WEEKLY: 2,
  MONTHLY: 7,
  QUARTERLY: 30,
} as const;

const LEVEL_CONDITIONS = [
  {
    level: 12,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousQuarter >= THRESHOLDS.QUARTERLY &&
      counts.daysInPrevious2Quarters >= THRESHOLDS.QUARTERLY &&
      counts.daysInPrevious3Quarters >= THRESHOLDS.QUARTERLY,
  },
  {
    level: 11,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousQuarter >= THRESHOLDS.QUARTERLY &&
      counts.daysInPrevious2Quarters >= THRESHOLDS.QUARTERLY,
  },
  {
    level: 10,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousQuarter >= THRESHOLDS.QUARTERLY,
  },
  {
    level: 9,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousMonth >= THRESHOLDS.MONTHLY &&
      counts.daysInPrevious2Months >= THRESHOLDS.MONTHLY &&
      counts.daysInPrevious3Months >= THRESHOLDS.MONTHLY,
  },
  {
    level: 8,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousMonth >= THRESHOLDS.MONTHLY &&
      counts.daysInPrevious2Months >= THRESHOLDS.MONTHLY,
  },
  {
    level: 7,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousMonth >= THRESHOLDS.MONTHLY,
  },
  {
    level: 6,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousWeek >= THRESHOLDS.WEEKLY &&
      counts.daysInPrevious2Weeks >= THRESHOLDS.WEEKLY &&
      counts.daysInPrevious3Weeks >= THRESHOLDS.WEEKLY,
  },
  {
    level: 5,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousWeek >= THRESHOLDS.WEEKLY &&
      counts.daysInPrevious2Weeks >= THRESHOLDS.WEEKLY,
  },
  {
    level: 4,
    check: (counts: PresenceCounts) =>
      counts.daysInPreviousWeek >= THRESHOLDS.WEEKLY,
  },
] as const;

const getTimeInterval = (start: Date, end: Date): TimeInterval => ({
  start: startOfDay(start),
  end: startOfDay(end),
});

const countActivitiesInInterval = (
  activities: Array<Date>,
  interval: TimeInterval,
): number => {
  const uniqueDays = new Set(
    activities
      .filter((date) => isWithinInterval(date, interval))
      .map((date) => date.toISOString().split("T")[0]),
  );
  return uniqueDays.size;
};

const calculateIntervals = (currentDate: Date) => {
  const weekOptions = { weekStartsOn: 1 as const };
  const previousWeekStart = subWeeks(currentDate, 1);

  const week = {
    start: startOfWeek(previousWeekStart, weekOptions),
    end: endOfWeek(previousWeekStart, weekOptions),
  };

  const week2 = {
    start: startOfWeek(subWeeks(week.start, 1), weekOptions),
    end: endOfWeek(subWeeks(week.end, 1), weekOptions),
  };

  const week3 = {
    start: startOfWeek(subWeeks(week2.start, 1), weekOptions),
    end: endOfWeek(subWeeks(week2.end, 1), weekOptions),
  };

  const month = {
    start: startOfMonth(subMonths(currentDate, 1)),
    end: endOfMonth(subMonths(currentDate, 1)),
  };

  const month2 = {
    start: startOfMonth(subMonths(month.start, 1)),
    end: endOfMonth(subMonths(month.end, 1)),
  };

  const month3 = {
    start: startOfMonth(subMonths(month2.start, 1)),
    end: endOfMonth(subMonths(month2.end, 1)),
  };

  const quarter = {
    start: startOfQuarter(subQuarters(currentDate, 1)),
    end: endOfQuarter(subQuarters(currentDate, 1)),
  };

  const quarter2 = {
    start: startOfQuarter(subQuarters(quarter.start, 1)),
    end: endOfQuarter(subQuarters(quarter.end, 1)),
  };

  const quarter3 = {
    start: startOfQuarter(subQuarters(quarter2.start, 1)),
    end: endOfQuarter(subQuarters(quarter2.end, 1)),
  };

  return {
    week: getTimeInterval(week.start, week.end),
    week2: getTimeInterval(week2.start, week2.end),
    week3: getTimeInterval(week3.start, week3.end),
    month: getTimeInterval(month.start, month.end),
    month2: getTimeInterval(month2.start, month2.end),
    month3: getTimeInterval(month3.start, month3.end),
    quarter: getTimeInterval(quarter.start, quarter.end),
    quarter2: getTimeInterval(quarter2.start, quarter2.end),
    quarter3: getTimeInterval(quarter3.start, quarter3.end),
  };
};

const getMemberLevel = (counts: PresenceCounts): number => {
  const matchingCondition = LEVEL_CONDITIONS.find(({ check }) => check(counts));
  return matchingCondition?.level ?? 0;
};

const getMemberMetrics = async (
  activities: ActivityWithType[],
  today: Date,
) => {
  const last3months = startOfDay(subMonths(today, 3));
  const previousWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

  const last3monthsActivities = activities.filter(
    (activity) =>
      isBefore(activity.created_at, previousWeekEnd) &&
      isAfter(activity.created_at, last3months),
  );

  const pulse = last3monthsActivities.reduce(
    (acc, activity) => acc + activity.activity_type.weight,
    0,
  );

  const maxWeight = Math.max(
    ...last3monthsActivities.map((activity) => activity.activity_type.weight),
    0,
  );

  const getMaxWeightActivity = (activities: ActivityWithType[]) => {
    if (!activities.length) return null;

    return activities.reduce((activity, current) =>
      current.activity_type.weight > activity?.activity_type.weight
        ? current
        : activity,
    );
  };

  const maxActivity = getMaxWeightActivity(last3monthsActivities);
  const { source, name } = maxActivity?.activity_type ?? {};
  const maxWeightActivity = maxActivity
    ? `${source?.slice(0, 1).toUpperCase()}${source?.slice(1).toLowerCase()} - ${name}`
    : "No activity";

  const presence = getMemberPresence(activities, today);
  const level = Math.max(maxWeight, presence);

  return {
    pulse,
    presence,
    level,
    max_weight: maxWeight,
    max_weight_activity: maxWeightActivity,
  };
};

export const calculateMemberMetrics = async (member: Member) => {
  const { id, workspace_id } = member;

  const today = new Date();
  const last365Days = subDays(today, 365);

  const firstActivity = await getFirstActivity(member);
  const activities = await listActivitiesIn365Days(member);

  const metrics = await getMemberMetrics(activities, today);
  const { pulse, presence, level } = metrics;

  const weekIntervals = eachWeekOfInterval(
    {
      start: last365Days,
      end: endOfDay(today),
    },
    { weekStartsOn: 1 },
  );

  const logs: Log[] = await Promise.all(
    weekIntervals.map(async (weekStart) => {
      const metrics = await getMemberMetrics(activities, weekStart);
      return {
        date: weekStart.toISOString(),
        ...metrics,
      };
    }),
  );

  await prisma.members.update({
    where: {
      id,
      workspace_id,
    },
    data: {
      pulse,
      presence,
      level,
      logs,
      first_activity: firstActivity?.created_at,
      last_activity: activities.at(-1)?.created_at,
    },
    include: {
      company: true,
    },
  });
};
