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

export type organizationsResponse = {
  results: {
    [key: string]: Organization;
  };
  statuses: {
    [key: string]: number;
  };
  errors: {
    [key: string]: unknown;
  };
};

export type Organization = {
  vanityName: string;
  localizedName: string;
  website?: {
    localized: {
      [key: string]: string;
    };
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  groups: unknown[];
  description?: {
    localized: {
      [key: string]: string;
    };
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  versionTag: string;
  coverPhotoV2?: {
    cropped: string;
    original: string;
    cropInfo: {
      x: number;
      width: number;
      y: number;
      height: number;
    };
  };
  defaultLocale: {
    country: string;
    language: string;
  };
  organizationType: string;
  alternativeNames: unknown[];
  specialties: Array<{
    locale: {
      country: string;
      language: string;
    };
    tags: string[];
  }>;
  localizedSpecialties: string[];
  industries: string[];
  name: {
    localized: {
      [key: string]: string;
    };
    preferredLocale: {
      country: string;
      language: string;
    };
  };
  primaryOrganizationType: string;
  locales: unknown[];
  id: number;
  localizedDescription?: string;
  localizedWebsite?: string;
  logoV2?: {
    cropped: string;
    original: string;
    cropInfo: {
      x: number;
      width: number;
      y: number;
      height: number;
    };
  };
  foundedOn?: {
    year: number;
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
    "displayImage~": {
      paging: {
        count: number;
        start: number;
        links: unknown[];
      };
      elements: Array<{
        artifact: string;
        authorizationMethod: string;
        data: {
          "com.linkedin.digitalmedia.mediaartifact.StillImage": {
            orientation: string;
            storageAspectRatio: {
              widthAspect: number;
              heightAspect: number;
              formatted: string;
            };
            storageSize: {
              width: number;
              height: number;
            };
            rawMetadataTags: unknown[];
            scale: string;
            mediaType: string;
            rawCodecSpec: {
              name: string;
              type: string;
            };
            displaySize: {
              width: number;
              uom: string;
              height: number;
            };
            displayAspectRatio: {
              widthAspect: number;
              heightAspect: number;
              formatted: string;
            };
          };
        };
        identifiers: Array<{
          identifier: string;
          index: number;
          mediaType: string;
          file: string;
          identifierType: string;
          identifierExpiresInSeconds: number;
        }>;
      }>;
    };
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
