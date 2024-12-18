export type Owner = {
  id: string;
  type: "people";
  attributes: {
    role: string;
    created_at: number;
    updated_at: number;
    timezone: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_link: string | null;
  };
};

export type Field = {
  id: string;
  type: string;
  order: number;
  required: boolean;
};

export type Event = {
  id: string;
  type: "events";
  attributes: {
    title: string;
    slug: string;
    registration_link: string;
    estimated_duration: number;
    registration_page_enabled: boolean;
    everyone_can_speak: boolean;
    description: string | null;
    status: string;
    light_registration_page_enabled: boolean;
    recording_enabled: boolean;
    recording_public: boolean;
    show_in_company_page: boolean;
    chat_enabled: boolean;
    polls_enabled: boolean;
    questions_enabled: boolean;
    language: string;
    published_at: number;
    scheduling_status: string;
    created_at: number;
    updated_at: number;
    owner: Owner;
    sessions_count: number;
    fields: Field[];
  };
};

export type Session = {
  id: string;
  type: "sessions";
  attributes: {
    event_id: string;
    status: string;
    timezone: string;
    room_link: string;
    name: string | null;
    attendees_count: number;
    duration: number | null;
    estimated_started_at: number;
    started_at: number;
    ended_at: number;
    canceled_at: number;
    created_at: number;
    updated_at: number;
    registrants_count: number;
    breakout_room_parent_session_id: string | null;
  };
};

export type People = {
  id: string;
  type: "people";
  attributes: {
    role: string;
    created_at: number;
    updated_at: number;
    timezone: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_link: string | null;
    registrant_detail: {
      event_id: string;
      session_id: string;
      created_at: number;
      updated_at: number;
      fields: Array<{
        id: string;
        type: string;
        value: string;
        required: boolean;
      }>;
      referrer: string | null;
      utm_source: string | null;
      utm_medium: string | null;
      utm_term: string | null;
      utm_content: string | null;
      utm_campaign: string | null;
      browser_version: string;
      browser_name: string;
      os_name: string;
      os_version: string;
      screen_height: string;
      screen_width: string;
      ip_city: string;
      ip_country_code: string;
      ip_country_name: string;
      password_key: string | null;
      connection_link: string;
      attended: boolean;
      attendance_rate: number;
      attendance_duration: number;
      has_viewed_replay: boolean;
      registration_type: string;
      is_highlighted: boolean;
      is_guest_speaker: boolean;
      session_role: string;
    };
    messages_count: number;
    questions_count: number;
    votes_count: number;
    up_votes_count: number;
    replay_view_detail: unknown | null;
  };
};

export type Organization = {
  id: string;
  type: string;
  attributes: {
    role: string;
    created_at: number;
    updated_at: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar_link: string | null;
    locale: string;
    pending_invite: boolean;
    website_link: string;
    linkedin_link: string | null;
    facebook_link: string | null;
    twitter_handle: string | null;
  };
  relationships: {
    organization: {
      data: {
        type: string;
        id: string;
      };
    };
  };
};

export type Webhook = {
  id: string;
  type: string;
  attributes: {
    created_at: number;
    updated_at: number;
    url: string;
    event: string;
  };
};
