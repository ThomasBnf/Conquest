import z from "zod";

export const ListOrganizationsSchema = z.object({
  paging: z.object({
    start: z.number(),
    count: z.number(),
    links: z.array(z.string()),
  }),
  elements: z.array(z.lazy(() => OrganizationElementSchema)),
});

export const OrganizationElementSchema = z.object({
  roleAssignee: z.string(),
  state: z.literal("APPROVED"),
  role: z.literal("ADMINISTRATOR"),
  organizationalTarget: z.string(),
});

export const OrganizationsSchema = z.object({
  results: z.record(
    z.object({
      vanityName: z.string(),
      localizedName: z.string(),
      website: z
        .object({
          localized: z.record(z.string()),
          preferredLocale: z.object({
            country: z.string(),
            language: z.string(),
          }),
        })
        .optional(),
      groups: z.array(z.unknown()),
      description: z
        .object({
          localized: z.record(z.string()),
          preferredLocale: z.object({
            country: z.string(),
            language: z.string(),
          }),
        })
        .optional(),
      versionTag: z.string(),
      coverPhotoV2: z
        .object({
          cropped: z.string(),
          original: z.string(),
          cropInfo: z.object({
            x: z.number(),
            width: z.number(),
            y: z.number(),
            height: z.number(),
          }),
        })
        .optional(),
      defaultLocale: z.object({
        country: z.string(),
        language: z.string(),
      }),
      organizationType: z.string(),
      alternativeNames: z.array(z.unknown()),
      specialties: z.array(
        z
          .object({
            locale: z.object({
              country: z.string(),
              language: z.string(),
            }),
            tags: z.array(z.string()),
          })
          .optional(),
      ),
      localizedSpecialties: z.array(z.string()),
      industries: z.array(z.string()),
      name: z.object({
        localized: z.record(z.string()),
        preferredLocale: z.object({
          country: z.string(),
          language: z.string(),
        }),
      }),
      primaryOrganizationType: z.string(),
      locations: z.array(z.unknown()),
      id: z.number(),
      localizedDescription: z.string().optional(),
      localizedWebsite: z.string().optional(),
      logoV2: z
        .object({
          cropped: z.string(),
          original: z.string(),
          cropInfo: z.object({
            x: z.number(),
            width: z.number(),
            y: z.number(),
            height: z.number(),
          }),
        })
        .optional(),
      foundedOn: z
        .object({
          year: z.number(),
        })
        .optional(),
    }),
  ),
  statuses: z.record(z.number()),
  errors: z.record(z.unknown()),
});

export const PostsSchema = z.object({
  paging: z
    .object({
      start: z.number(),
      count: z.number(),
      links: z.array(z.unknown()),
      total: z.number(),
    })
    .optional(),
  elements: z.array(
    z.object({
      isReshareDisabledByAuthor: z.boolean(),
      lifecycleState: z.string(),
      createdAt: z.number(),
      lastModifiedAt: z.number(),
      visibility: z.string(),
      publishedAt: z.number(),
      author: z.string(),
      id: z.string(),
      distribution: z.object({
        feedDistribution: z.string(),
        thirdPartyDistributionChannels: z.array(z.string()),
      }),
      commentary: z.string(),
      lifecycleStateInfo: z.object({
        isEditedByAuthor: z.boolean(),
      }),
    }),
  ),
});

export const SocialActionsSchema = z.object({
  paging: z
    .object({
      start: z.number(),
      count: z.number(),
      links: z.array(z.unknown()),
      total: z.number(),
    })
    .optional(),
  elements: z.array(
    z.object({
      actor: z.string(),
      created: z.object({
        actor: z.string(),
        time: z.number(),
      }),
      lastModified: z.object({
        actor: z.string(),
        time: z.number(),
      }),
      id: z.string().optional(),
      $URN: z.string(),
      message: z
        .object({
          attributes: z.array(z.unknown()),
          text: z.string(),
        })
        .optional(),
      object: z.string(),
    }),
  ),
});

export const PeopleSchema = z.object({
  localizedLastName: z.string(),
  profilePicture: z.object({
    displayImage: z.string(),
    "displayImage~": z.object({
      paging: z.object({
        count: z.number(),
        start: z.number(),
        links: z.array(z.unknown()),
      }),
      elements: z.array(
        z.object({
          artifact: z.string(),
          authorizationMethod: z.string(),
          data: z.object({
            "com.linkedin.digitalmedia.mediaartifact.StillImage": z.object({
              orientation: z.string(),
              storageAspectRatio: z.object({
                widthAspect: z.number(),
                heightAspect: z.number(),
                formatted: z.string(),
              }),
              storageSize: z.object({
                width: z.number(),
                height: z.number(),
              }),
              rawMetadataTags: z.array(z.unknown()),
              scale: z.string(),
              mediaType: z.string(),
              rawCodecSpec: z.object({
                name: z.string(),
                type: z.string(),
              }),
              displaySize: z.object({
                width: z.number(),
                uom: z.string(),
                height: z.number(),
              }),
              displayAspectRatio: z.object({
                widthAspect: z.number(),
                heightAspect: z.number(),
                formatted: z.string(),
              }),
            }),
          }),
          identifiers: z.array(
            z.object({
              identifier: z.string(),
              index: z.number(),
              mediaType: z.string(),
              file: z.string(),
              identifierType: z.string(),
              identifierExpiresInSeconds: z.number(),
            }),
          ),
        }),
      ),
    }),
  }),
  firstName: z.object({
    localized: z.record(z.string()),
    preferredLocale: z.object({
      country: z.string(),
      language: z.string(),
    }),
  }),
  vanityName: z.string(),
  lastName: z.object({
    localized: z.record(z.string()),
    preferredLocale: z.object({
      country: z.string(),
      language: z.string(),
    }),
  }),
  localizedHeadline: z.string(),
  id: z.string(),
  headline: z.object({
    localized: z.record(z.string()),
    preferredLocale: z.object({
      country: z.string(),
      language: z.string(),
    }),
  }),
  localizedFirstName: z.string(),
});

export type Posts = z.infer<typeof PostsSchema>;
export type SocialActions = z.infer<typeof SocialActionsSchema>;
