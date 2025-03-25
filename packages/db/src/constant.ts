export const DISCOURSE_ACTIVITY_TYPES = [
  {
    name: "Invite",
    source: "Discourse" as const,
    key: "discourse:invite",
    points: 7,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Post marked as solved",
    source: "Discourse" as const,
    key: "discourse:solved",
    points: 7,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Write a topic",
    source: "Discourse" as const,
    key: "discourse:topic",
    points: 6,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Reply to topic",
    source: "Discourse" as const,
    key: "discourse:reply",
    points: 5,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Add reaction",
    source: "Discourse" as const,
    key: "discourse:reaction",
    points: 1,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Login",
    source: "Discourse" as const,
    key: "discourse:login",
    points: 0,
    conditions: { rules: [] },
    deletable: false,
  },
];

export const DISCORD_ACTIVITY_TYPES = [
  {
    name: "Create a thread",
    source: "Discord" as const,
    key: "discord:thread",
    points: 6,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Reply to a thread",
    source: "Discord" as const,
    key: "discord:reply_thread",
    points: 5,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Write a message",
    source: "Discord" as const,
    key: "discord:message",
    points: 6,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Reply to message",
    source: "Discord" as const,
    key: "discord:reply",
    points: 4,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Add reaction",
    source: "Discord" as const,
    key: "discord:reaction",
    points: 1,
    conditions: { rules: [] },
    deletable: false,
  },
];

export const GITHUB_ACTIVITY_TYPES = [
  {
    name: "Create a pull request",
    source: "Github" as const,
    key: "github:pr",
    points: 9,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Create an issue",
    source: "Github" as const,
    key: "github:issue",
    points: 4,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Create a comment",
    source: "Github" as const,
    key: "github:comment",
    points: 4,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Starred a repository",
    source: "Github" as const,
    key: "github:star",
    points: 2,
    conditions: { rules: [] },
    deletable: false,
  },
];

export const LIVESTORM_ACTIVITY_TYPES = [
  {
    name: "Co-host a webinar",
    source: "Livestorm" as const,
    key: "livestorm:co-host",
    points: 10,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Attend a webinar",
    source: "Livestorm" as const,
    key: "livestorm:attend",
    points: 8,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Register for a webinar",
    source: "Livestorm" as const,
    key: "livestorm:register",
    points: 5,
    conditions: { rules: [] },
    deletable: false,
  },
];

export const LINKEDIN_ACTIVITY_TYPES = [
  {
    name: "Comment a post",
    source: "Linkedin" as const,
    key: "linkedin:comment",
    points: 1,
    conditions: { rules: [] },
    deletable: false,
  },
];

export const SLACK_ACTIVITY_TYPES = [
  {
    name: "Message",
    source: "Slack" as const,
    key: "slack:message",
    points: 6,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Reply",
    source: "Slack" as const,
    key: "slack:reply",
    points: 5,
    conditions: { rules: [] },
    deletable: false,
  },
  {
    name: "Reaction",
    source: "Slack" as const,
    key: "slack:reaction",
    points: 1,
    conditions: { rules: [] },
    deletable: false,
  },
];
