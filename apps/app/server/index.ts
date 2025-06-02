import { CSVRouter } from "@/features/csv/api/router";
import { tasksRouter } from "@/features/tasks/api/router";
import { activitiesRouter } from "./activities/router";
import { activityTypesRouter } from "./activity-types/router";
import { adminRouter } from "./admin/router";
import { apiKeysRouter } from "./api-keys/router";
import { channelsRouter } from "./channels/router";
import { companiesRouter } from "./companies/router";
import { dashboardRouter } from "./dashboard/router";
import { discordRouter } from "./discord/router";
import { discourseRouter } from "./discourse/router";
import { duplicateRouter } from "./duplicate/router";
import { eventsRouter } from "./events/router";
import { githubRouter } from "./github/router";
import { integrationsRouter } from "./integrations/router";
import { levelsRouter } from "./levels/router";
import { listsRouter } from "./lists/router";
import { logsRouter } from "./logs/router";
import { membersRouter } from "./members/router";
import { profilesRouter } from "./profiles/router";
import { runsRouter } from "./runs/router";
import { slackRouter } from "./slack/router";
import { stripeRouter } from "./stripe/router";
import { tagsRouter } from "./tags/router";
import { teamRouter } from "./team/router";
import { router } from "./trpc";
import { userInWorkspaceRouter } from "./userInWorkspace/router";
import { usersRouter } from "./users/router";
import { workflowsRouter } from "./workflows/route";
import { workspacesRouter } from "./workspaces/router";

export const appRouter = router({
  activityTypes: activityTypesRouter,
  activities: activitiesRouter,
  admin: adminRouter,
  apiKeys: apiKeysRouter,
  channels: channelsRouter,
  companies: companiesRouter,
  csv: CSVRouter,
  dashboard: dashboardRouter,
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
  userInWorkspace: userInWorkspaceRouter,
  profiles: profilesRouter,
  runs: runsRouter,
  slack: slackRouter,
  stripe: stripeRouter,
  tags: tagsRouter,
  tasks: tasksRouter,
  team: teamRouter,
  users: usersRouter,
  workflows: workflowsRouter,
  workspaces: workspacesRouter,
});

export type AppRouter = typeof appRouter;
