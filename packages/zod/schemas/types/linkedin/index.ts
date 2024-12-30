export type organizationalEntityAclsResponse = {
  paging: {
    start: number;
    count: number;
    links: string[];
  };
  elements: organizationalEntityAcls[];
};

export type organizationalEntityAcls = {
  roleAssignee: string;
  state: "APPROVED";
  role: "ADMINISTRATOR";
  organizationalTarget: string;
};

export type Orgnaization = {
  vanityName: string;
  website: {
    localized: { [key: string]: string };
    preferredLocale: { country: string; language: string };
  };
  localizedName: string;
  created: {
    actor: string;
    time: number;
  };
  groups: unknown[];
  description: {
    localized: { [key: string]: string };
    preferredLocale: { country: string; language: string };
  };
  versionTag: string;
  defaultLocale: {
    country: string;
    language: string;
  };
  organizationType: string;
  alternativeNames: unknown[];
  specialties: unknown[];
  localizedSpecialties: unknown[];
  name: {
    localized: { [key: string]: string };
    preferredLocale: { country: string; language: string };
  };
  primaryOrganizationType: string;
  locations: unknown[];
  lastModified: {
    actor: string;
    time: number;
  };
  id: number;
  localizedDescription: string;
  autoCreated: boolean;
  localizedWebsite: string;
  logoV2: {
    cropped: string;
    original: string;
    cropInfo: {
      x: number;
      width: number;
      y: number;
      height: number;
    };
  };
};

export type PostsResponse = {
  paging?: {
    start: number;
    count: number;
    links: unknown[];
    total: number;
  };
  elements: {
    isReshareDisabledByAuthor: boolean;
    lifecycleState: string;
    createdAt: number;
    lastModifiedAt: number;
    visibility: string;
    publishedAt: number;
    author: string;
    id: string;
    distribution: {
      feedDistribution: string;
      thirdPartyDistributionChannels: string[];
    };
    commentary: string;
    lifecycleStateInfo: {
      isEditedByAuthor: boolean;
    };
  }[];
};

export type SocialActionsResponse = {
  paging?: {
    start: number;
    count: number;
    links: unknown[];
    total: number;
  };
  elements: {
    actor: string;
    created: {
      actor: string;
      time: number;
    };
    lastModified: {
      actor: string;
      time: number;
    };
    id: string;
    $URN: string;
    message: {
      attributes: unknown[];
      text: string;
    };
    object: string;
  }[];
};

export type PeopleResponse = {
  localizedLastName: string;
  profilePicture: {
    displayImage: string;
  };
  firstName: {
    localized: { [key: string]: string };
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  vanityName: string;
  lastName: {
    localized: { [key: string]: string };
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  localizedHeadline: string;
  id: string;
  headline: {
    localized: { [key: string]: string };
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  localizedFirstName: string;
};
