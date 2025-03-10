SET allow_experimental_json_type=1;

CREATE TABLE IF NOT EXISTS activity
(
    id UUID DEFAULT generateUUIDv4(),
    external_id String,
    title String,
    message String,
    reply_to Nullable(String),
    react_to Nullable(String),
    invite_to Nullable(String),
    source String,
    activity_type_id UUID,
    channel_id UUID,
    event_id Nullable(String),
    member_id UUID,
    workspace_id UUID,
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY workspace_id
ORDER BY (workspace_id, external_id, id, created_at);


CREATE TABLE IF NOT EXISTS activity_type
(
    id UUID DEFAULT generateUUIDv4(),
    name String,
    source String,
    key String,
    points UInt16,
    conditions JSON,
    deletable Boolean DEFAULT false,
    workspace_id UUID,
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(updated_at)
PARTITION BY workspace_id
ORDER BY (workspace_id, id);


CREATE TABLE IF NOT EXISTS channel
(
    id UUID DEFAULT generateUUIDv4(),
    external_id String,
    name String,
    slug String,
    source String,
    workspace_id UUID,
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY workspace_id
ORDER BY (workspace_id, external_id, id);


CREATE TABLE IF NOT EXISTS company
(
    id UUID DEFAULT generateUUIDv4(),
    name String,
    industry Nullable(String),
    address Nullable(String),
    domain Nullable(String),
    employees Nullable(UInt32),
    founded_at Nullable(DateTime),
    logo_url Nullable(String),
    tags Array(String) DEFAULT [],
    source String,
    workspace_id UUID,
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY workspace_id
ORDER BY (workspace_id, id);


CREATE TABLE IF NOT EXISTS level
(
    id UUID DEFAULT generateUUIDv4(),
    name String,
    number UInt8,
    `from` UInt16,
    `to` Nullable(UInt16),
    workspace_id UUID,
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY workspace_id
ORDER BY (workspace_id, id);


CREATE TABLE IF NOT EXISTS log
(
    id UUID DEFAULT generateUUIDv4(),
    date DateTime,
    pulse UInt32 DEFAULT 0,
    level_id Nullable(UUID),
    member_id UUID,
    workspace_id UUID
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (member_id, date, id);


CREATE TABLE IF NOT EXISTS member
(
    id UUID DEFAULT generateUUIDv4(),
    first_name String,
    last_name String,
    primary_email String,
    secondary_emails Array(String),
    phones Array(String),
    job_title Nullable(String),
    avatar_url Nullable(String),
    country Nullable(String),
    language Nullable(String),
    tags Array(String),
    pulse Int32 DEFAULT 0,
    source String,
    level_id Nullable(UUID),
    linkedin_url Nullable(String),
    company_id Nullable(UUID),
    workspace_id UUID,
    first_activity Nullable(DateTime),
    last_activity Nullable(DateTime),
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY workspace_id
ORDER BY (workspace_id, id);


CREATE TABLE IF NOT EXISTS profile
(
    id UUID DEFAULT generateUUIDv4(),
    external_id String,
    attributes JSON,
    member_id UUID,
    workspace_id UUID,
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(updated_at)
PARTITION BY workspace_id
ORDER BY (workspace_id, member_id, id);
