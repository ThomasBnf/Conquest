export const DISCOURSE_ACTIVITY_TYPES = [
  {
    key: "discourse:invite",
    name: "Invite",
    source: "Discourse" as const,
    points: 7,
    conditions: [],
    deletable: false,
  },
  {
    key: "discourse:solved",
    name: "Post marked as solved",
    source: "Discourse" as const,
    points: 7,
    conditions: [],
    deletable: false,
  },
  {
    key: "discourse:topic",
    name: "Write a topic",
    source: "Discourse" as const,
    points: 6,
    conditions: [],
    deletable: false,
  },
  {
    key: "discourse:reply",
    name: "Reply to topic",
    source: "Discourse" as const,
    points: 5,
    conditions: [],
    deletable: false,
  },
  {
    key: "discourse:reaction",
    name: "Add reaction",
    source: "Discourse" as const,
    points: 1,
    conditions: [],
    deletable: false,
  },
  {
    key: "discourse:login",
    name: "Login",
    source: "Discourse" as const,
    points: 0,
    conditions: [],
    deletable: false,
  },
];

export const DISCORD_ACTIVITY_TYPES = [
  {
    key: "discord:thread",
    name: "Create a thread",
    source: "Discord" as const,
    points: 6,
    conditions: [],
    deletable: false,
  },
  {
    key: "discord:reply_thread",
    name: "Reply to a thread",
    source: "Discord" as const,
    points: 5,
    conditions: [],
    deletable: false,
  },
  {
    key: "discord:message",
    name: "Write a message",
    source: "Discord" as const,
    points: 6,
    conditions: [],
    deletable: false,
  },
  {
    key: "discord:reply",
    name: "Reply to message",
    source: "Discord" as const,
    points: 4,
    conditions: [],
    deletable: false,
  },
  {
    key: "discord:reaction",
    name: "Add reaction",
    source: "Discord" as const,
    points: 1,
    conditions: [],
    deletable: false,
  },
];

export const GITHUB_ACTIVITY_TYPES = [
  {
    key: "github:pr",
    name: "Create a pull request",
    source: "Github" as const,
    points: 9,
    conditions: [],
    deletable: false,
  },
  {
    key: "github:issue",
    name: "Create an issue",
    source: "Github" as const,
    points: 4,
    conditions: [],
    deletable: false,
  },
  {
    key: "github:comment",
    name: "Create a comment",
    source: "Github" as const,
    points: 4,
    conditions: [],
    deletable: false,
  },
  {
    key: "github:star",
    name: "Starred a repository",
    source: "Github" as const,
    points: 2,
    conditions: [],
    deletable: false,
  },
];

export const LIVESTORM_ACTIVITY_TYPES = [
  {
    key: "livestorm:co-host",
    name: "Co-host a webinar",
    source: "Livestorm" as const,
    points: 10,
    conditions: [],
    deletable: false,
  },
  {
    key: "livestorm:attend",
    name: "Attend a webinar",
    source: "Livestorm" as const,
    points: 8,
    conditions: [],
    deletable: false,
  },
  {
    key: "livestorm:register",
    name: "Register for a webinar",
    source: "Livestorm" as const,
    points: 5,
    conditions: [],
    deletable: false,
  },
];

export const LINKEDIN_ACTIVITY_TYPES = [
  {
    key: "linkedin:comment",
    name: "Comment a post",
    source: "Linkedin" as const,
    points: 1,
    conditions: [],
    deletable: false,
  },
];

export const SLACK_ACTIVITY_TYPES = [
  {
    key: "slack:message",
    name: "Message",
    source: "Slack" as const,
    points: 6,
    conditions: [],
    deletable: false,
  },
  {
    key: "slack:reply",
    name: "Reply",
    source: "Slack" as const,
    points: 5,
    conditions: [],
    deletable: false,
  },
  {
    key: "slack:reaction",
    name: "Reaction",
    source: "Slack" as const,
    points: 1,
    conditions: [],
    deletable: false,
  },
];
