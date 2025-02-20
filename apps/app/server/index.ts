import { activitiesRouter } from "./activities/router";
import { activityTypesRouter } from "./activity-types/router";
import { apiKeysRouter } from "./api-keys/router";
import { authRouter } from "./auth/router";
import { channelsRouter } from "./channels/router";
import { companiesRouter } from "./companies/router";
import { dashboardRouter } from "./dashboard/router";
import { discordRouter } from "./discord/router";
import { discourseRouter } from "./discourse/router";
import { eventsRouter } from "./events/router";
import { integrationsRouter } from "./integrations/router";
import { levelsRouter } from "./levels/router";
import { listsRouter } from "./lists/router";
import { livestormRouter } from "./livestorm/router";
import { membersRouter } from "./members/router";
import { profilesRouter } from "./profiles/router";
import { slackRouter } from "./slack/router";
import { sourceRouter } from "./source/router";
import { tagsRouter } from "./tags/router";
import { router } from "./trpc";
import { usersRouter } from "./users/router";
import { workspacesRouter } from "./workspaces/router";

export const appRouter = router({
  activityTypes: activityTypesRouter,
  activities: activitiesRouter,
  apiKeys: apiKeysRouter,
  auth: authRouter,
  channels: channelsRouter,
  companies: companiesRouter,
  dashboard: dashboardRouter,
  discord: discordRouter,
  discourse: discourseRouter,
  events: eventsRouter,
  integrations: integrationsRouter,
  levels: levelsRouter,
  lists: listsRouter,
  livestorm: livestormRouter,
  members: membersRouter,
  profiles: profilesRouter,
  slack: slackRouter,
  sources: sourceRouter,
  tags: tagsRouter,
  users: usersRouter,
  workspaces: workspacesRouter,
});

export type AppRouter = typeof appRouter;
