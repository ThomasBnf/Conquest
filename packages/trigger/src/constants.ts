export const GITHUB_ACTIVITY_TYPES = [
  {
    name: "Starred a repository",
    source: "GITHUB" as const,
    key: "github:star",
    weight: 2,
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
