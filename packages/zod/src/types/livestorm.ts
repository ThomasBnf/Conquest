import { z } from "zod";

export const OwnerSchema = z.object({
  id: z.string(),
  type: z.literal("people"),
  attributes: z.object({
    role: z.string(),
    created_at: z.number(),
    updated_at: z.number(),
    timezone: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    avatar_link: z.string().nullable(),
  }),
});

export const FieldSchema = z.object({
  id: z.string(),
  type: z.string(),
  order: z.number(),
  required: z.boolean(),
});

export const PeopleRegisteredSchema = z.object({
  role: z.string(),
  created_at: z.number().int(),
  updated_at: z.number().int(),
  timezone: z.string().nullable(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  avatar_link: z.string().nullable(),
  registrant_detail: z.object({
    event_id: z.string(),
    session_id: z.string(),
    created_at: z.number().int(),
    updated_at: z.number().int(),
    fields: z.array(
      z.object({
        id: z.string(),
        type: z.string(),
        value: z.string().nullable(),
        required: z.boolean(),
      }),
    ),
    referrer: z.string().nullable(),
    utm_source: z.string().nullable(),
    utm_medium: z.string().nullable(),
    utm_term: z.string().nullable(),
    utm_content: z.string().nullable(),
    utm_campaign: z.string().nullable(),
    browser_version: z.string(),
    browser_name: z.string(),
    os_name: z.string(),
    os_version: z.string(),
    screen_height: z.string(),
    screen_width: z.string(),
    ip_city: z.string().nullable(),
    ip_country_code: z.string().nullable(),
    ip_country_name: z.string().nullable(),
    password_key: z.string(),
    connection_link: z.string().url(),
    attended: z.boolean(),
    attendance_rate: z.number().nullable(),
    attendance_duration: z.number(),
    has_viewed_replay: z.boolean(),
    registration_type: z.string(),
    is_highlighted: z.boolean(),
    is_guest_speaker: z.boolean(),
    session_role: z.string().nullable(),
  }),
  messages_count: z.number(),
  questions_count: z.number(),
  votes_count: z.number(),
  up_votes_count: z.number(),
  replay_view_detail: z.unknown().nullable(),
});

export const EventSchema = z.object({
  id: z.string(),
  type: z.literal("events"),
  attributes: z.object({
    title: z.string(),
    slug: z.string(),
    registration_link: z.string().url(),
    estimated_duration: z.number().int().positive(),
    registration_page_enabled: z.boolean(),
    everyone_can_speak: z.boolean(),
    description: z.string().nullable(),
    status: z.string(),
    light_registration_page_enabled: z.boolean(),
    recording_enabled: z.boolean(),
    recording_public: z.boolean().nullable(),
    show_in_company_page: z.boolean(),
    chat_enabled: z.boolean(),
    polls_enabled: z.boolean(),
    questions_enabled: z.boolean(),
    language: z.string().length(2),
    published_at: z.number().int(),
    scheduling_status: z.enum([
      "live",
      "upcoming",
      "on_demand",
      "ended",
      "not_started",
      "draft",
      "cancelled",
      "not_scheduled",
    ]),
    created_at: z.number().int(),
    updated_at: z.number().int(),
    owner: OwnerSchema,
    sessions_count: z.number().int().min(0),
    fields: z.array(FieldSchema),
  }),
});

export const getEventSchema = z.object({
  data: EventSchema,
});

export const ListEventsSchema = z.object({
  data: z.array(EventSchema),
  meta: z.object({
    current_page: z.number(),
    previous_page: z.boolean().nullable(),
    next_page: z.boolean().nullable(),
    record_count: z.number(),
    page_count: z.number(),
    items_per_page: z.number(),
  }),
});

export const SessionSchema = z.object({
  id: z.string(),
  type: z.literal("sessions"),
  attributes: z.object({
    event_id: z.string(),
    status: z.enum([
      "upcoming",
      "live",
      "on_demand",
      "past",
      "past_not_started",
      "canceled",
      "draft",
    ]),
    timezone: z.string(),
    room_link: z.string().url(),
    name: z.string().nullable(),
    attendees_count: z.number().min(0),
    duration: z.number().nullable(),
    estimated_started_at: z.number().int(),
    started_at: z.number().int(),
    ended_at: z.number().int(),
    canceled_at: z.number().int(),
    created_at: z.number().int(),
    updated_at: z.number().int(),
    registrants_count: z.number().min(0),
    breakout_room_parent_session_id: z.string().nullable(),
  }),
});

export const ListEventSessionsSchema = z.object({
  data: z.array(SessionSchema),
  meta: z.object({
    current_page: z.number(),
    previous_page: z.boolean().nullable(),
    next_page: z.boolean().nullable(),
    record_count: z.number(),
    page_count: z.number(),
    items_per_page: z.number(),
  }),
});

export const PeopleSchema = z.object({
  data: z
    .object({
      id: z.string(),
      type: z.literal("people"),
      attributes: z.object({
        role: z.string(),
        created_at: z.number(),
        updated_at: z.number(),
        timezone: z.string(),
        first_name: z.string(),
        last_name: z.string(),
        email: z.string(),
        avatar_link: z.string().nullable(),
        registrant_detail: z.object({
          event_id: z.string(),
          session_id: z.string(),
          created_at: z.number(),
          updated_at: z.number(),
          fields: z.array(
            z.object({
              id: z.string(),
              type: z.string(),
              value: z.string().nullable(),
              required: z.boolean(),
            }),
          ),
          referrer: z.string().nullable(),
          utm_source: z.string().nullable(),
          utm_medium: z.string().nullable(),
          utm_term: z.string().nullable(),
          utm_content: z.string().nullable(),
          utm_campaign: z.string().nullable(),
          browser_version: z.string().nullable(),
          browser_name: z.string().nullable(),
          os_name: z.string().nullable(),
          os_version: z.string().nullable(),
          screen_height: z.string().nullable(),
          screen_width: z.string().nullable(),
          ip_city: z.string(),
          ip_country_code: z.string(),
          ip_country_name: z.string(),
          password_key: z.string().nullable(),
          connection_link: z.string(),
          attended: z.boolean(),
          attendance_rate: z.number().nullable(),
          attendance_duration: z.number(),
          has_viewed_replay: z.boolean(),
          registration_type: z.string(),
          is_highlighted: z.boolean(),
          is_guest_speaker: z.boolean(),
          session_role: z.string().nullable(),
        }),
        messages_count: z.number(),
        questions_count: z.number(),
        votes_count: z.number(),
        up_votes_count: z.number(),
        replay_view_detail: z.unknown().nullable(),
      }),
    })
    .array(),
  meta: z.object({
    current_page: z.number(),
    previous_page: z.boolean().nullable(),
    next_page: z.boolean().nullable(),
    record_count: z.number(),
    page_count: z.number(),
    items_per_page: z.number(),
  }),
});

export const OrganizationSchema = z.object({
  data: z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.object({
      role: z.string(),
      created_at: z.number(),
      updated_at: z.number(),
      first_name: z.string(),
      last_name: z.string(),
      email: z.string(),
      avatar_link: z.string().nullable(),
      locale: z.string(),
      pending_invite: z.boolean(),
      website_link: z.string(),
      linkedin_link: z.string().nullable(),
      facebook_link: z.string().nullable(),
      twitter_handle: z.string().nullable(),
    }),
    relationships: z.object({
      organization: z.object({
        data: z.object({
          type: z.string(),
          id: z.string(),
        }),
      }),
    }),
  }),
  included: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      attributes: z.object({
        name: z.string(),
        slug: z.string(),
      }),
    }),
  ),
});

export const SessionWebhookSchema = z.object({
  event_id: z.string(),
  status: z.string(),
  timezone: z.string(),
  room_link: z.string(),
  name: z.string().nullable(),
  attendees_count: z.number(),
  duration: z.number().nullable(),
  estimated_started_at: z.number(),
  started_at: z.number(),
  ended_at: z.number(),
  canceled_at: z.number(),
  created_at: z.number(),
  updated_at: z.number(),
  registrants_count: z.number(),
  breakout_room_parent_session_id: z.string().nullable(),
});

export const WebhookSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      attributes: z.object({
        created_at: z.number(),
        updated_at: z.number(),
        url: z.string(),
        event: z.string(),
      }),
    }),
  ),
  meta: z.object({
    current_page: z.number(),
    previous_page: z.boolean().nullable(),
    next_page: z.boolean().nullable(),
    record_count: z.number(),
    page_count: z.number(),
    items_per_page: z.number(),
  }),
});

export type Event = z.infer<typeof EventSchema>;
export type Session = z.infer<typeof SessionSchema>;
