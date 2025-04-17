import { activitiesRouter } from "./activities/router";
import { activityTypesRouter } from "./activity-types/router";
import { apiKeysRouter } from "./api-keys/router";
import { brevoRouter } from "./brevo/router";
import { channelsRouter } from "./channels/router";
import { companiesRouter } from "./companies/router";
import { dashboardRouter } from "./dashboard/router";
import { dbRouter } from "./db/router";
import { discordRouter } from "./discord/router";
import { discourseRouter } from "./discourse/router";
import { duplicateRouter } from "./duplicate/router";
import { eventsRouter } from "./events/router";
import { githubRouter } from "./github/router";
import { integrationsRouter } from "./integrations/router";
import { levelsRouter } from "./levels/router";
import { listsRouter } from "./lists/router";
import { logsRouter } from "./logs/router";
import { memberInWorkspaceRouter } from "./memberInWorkspace/router";
import { membersRouter } from "./members/router";
import { profilesRouter } from "./profiles/router";
import { slackRouter } from "./slack/router";
import { stripeRouter } from "./stripe/router";
import { tagsRouter } from "./tags/router";
import { router } from "./trpc";
import { usersRouter } from "./users/router";
import { workspacesRouter } from "./workspaces/router";

export const appRouter = router({
  activityTypes: activityTypesRouter,
  activities: activitiesRouter,
  apiKeys: apiKeysRouter,
  brevo: brevoRouter,
  channels: channelsRouter,
  companies: companiesRouter,
  dashboard: dashboardRouter,
  db: dbRouter,
  discord: discordRouter,
  discourse: discourseRouter,
  duplicate: duplicateRouter,
  events: eventsRouter,
  github: githubRouter,
  integrations: integrationsRouter,
  levels: levelsRouter,
  lists: listsRouter,
  logs: logsRouter,
  members: membersRouter,
  memberInWorkspace: memberInWorkspaceRouter,
  profiles: profilesRouter,
  slack: slackRouter,
  stripe: stripeRouter,
  tags: tagsRouter,
  users: usersRouter,
  workspaces: workspacesRouter,
});

export type AppRouter = typeof appRouter;
