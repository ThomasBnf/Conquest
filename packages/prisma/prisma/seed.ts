import { PrismaClient } from "@prisma/client";
import { subDays } from "date-fns";
import contacts from "./contacts.json";

const prisma = new PrismaClient();

export const seed = async () => {
  const workspace = await prisma.workspace.findFirst();
  const workspace_id = workspace?.id;
  const today = new Date();

  if (!workspace_id) {
    throw new Error("Workspace not found");
  }

  for (const contact of contacts) {
    await prisma.contact.create({
      data: {
        workspace_id,
        first_name: contact.firstName,
        last_name: contact.lastName,
        full_name: `${contact.firstName} ${contact.lastName}`,
        emails: contact.emails,
        phone: null,
        avatar_url: null,
        bio: null,
        gender: null,
        address: null,
        search: `${contact.firstName.toLowerCase()} ${contact.lastName.toLowerCase()} ${contact.emails.join(" ")}`,
        source: "API",
        tags: [],
        created_at: subDays(today, contact.activities[0].daysAgo),
        updated_at: subDays(today, contact.activities[0].daysAgo),
        joined_at: subDays(today, contact.activities[0].daysAgo),
        activities: {
          create: contact.activities.map((activity) => ({
            details: {
              source: "API",
              type: activity.type,
              message:
                activity.message ||
                (activity.type === "SIGNUP"
                  ? "New contact registered"
                  : activity.type === "LOGIN"
                    ? "First login completed"
                    : activity.type === "POST"
                      ? "First message posted"
                      : activity.type === "REPLY"
                        ? "First reply posted"
                        : activity.message),
            },
            workspace_id,
            created_at: subDays(today, activity.daysAgo),
            updated_at: subDays(today, activity.daysAgo),
          })),
        },
      },
    });
  }
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
