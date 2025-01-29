export const DISCORD_ACTIVITY_TYPES = [
  {
    name: "Invite",
    source: "DISCORD" as const,
    key: "discord:invite",
    weight: 7,
    deletable: false,
  },
  {
    name: "Write a post",
    source: "DISCORD" as const,
    key: "discord:post",
    weight: 6,
    deletable: false,
  },
  {
    name: "Reply to post",
    source: "DISCORD" as const,
    key: "discord:reply",
    weight: 5,
    deletable: false,
  },
  {
    name: "Join Discord community",
    source: "DISCORD" as const,
    key: "discord:join",
    weight: 4,
    deletable: false,
  },
  {
    name: "Add reaction",
    source: "DISCORD" as const,
    key: "discord:reaction",
    weight: 0,
    deletable: false,
  },
];

export const DISCOURSE_ACTIVITY_TYPES = [
  {
    name: "Invite",
    source: "DISCOURSE" as const,
    key: "discourse:invite",
    weight: 7,
    channels: [],
    deletable: false,
  },
  {
    name: "Post marked as solved",
    source: "DISCOURSE" as const,
    key: "discourse:solved",
    weight: 7,
    deletable: false,
  },
  {
    name: "Write a topic",
    source: "DISCOURSE" as const,
    key: "discourse:topic",
    weight: 6,
    deletable: false,
  },
  {
    name: "Reply to topic",
    source: "DISCOURSE" as const,
    key: "discourse:reply",
    weight: 5,
    deletable: false,
  },
  {
    name: "Join Discourse community",
    source: "DISCOURSE" as const,
    key: "discourse:join",
    weight: 4,
    deletable: false,
  },
  {
    name: "Login",
    source: "DISCOURSE" as const,
    key: "discourse:login",
    weight: 0,
    deletable: false,
  },
  {
    name: "Add reaction",
    source: "DISCOURSE" as const,
    key: "discourse:reaction",
    weight: 0,
    deletable: false,
  },
];

export const LIVESTORM_ACTIVITY_TYPES = [
  {
    name: "Co-host a webinar",
    source: "LIVESTORM" as const,
    key: "livestorm:co-host",
    weight: 10,
    deletable: false,
  },
  {
    name: "Attend a webinar",
    source: "LIVESTORM" as const,
    key: "livestorm:attend",
    weight: 8,
    deletable: false,
  },
  {
    name: "Register for a webinar",
    source: "LIVESTORM" as const,
    key: "livestorm:register",
    weight: 5,
    deletable: false,
  },
];

export const LINKEDIN_ACTIVITY_TYPES = [
  {
    name: "Comment a post",
    source: "LINKEDIN" as const,
    key: "linkedin:comment",
    weight: 1,
    deletable: false,
  },
];

export const SLACK_ACTIVITY_TYPES = [
  {
    name: "Invitation",
    source: "SLACK" as const,
    key: "slack:invitation",
    weight: 7,
    deletable: false,
  },
  {
    name: "Write a post",
    source: "SLACK" as const,
    key: "slack:post",
    weight: 6,
    deletable: false,
  },
  {
    name: "Reply to post",
    source: "SLACK" as const,
    key: "slack:reply",
    weight: 5,
    deletable: false,
  },
  {
    name: "Join Slack community",
    source: "SLACK" as const,
    key: "slack:join",
    weight: 4,
    deletable: false,
  },
  {
    name: "Add reaction",
    source: "SLACK" as const,
    key: "slack:reaction",
    weight: 0,
    deletable: false,
  },
];
