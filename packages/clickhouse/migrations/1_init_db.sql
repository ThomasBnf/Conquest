SET allow_experimental_json_type=1;

CREATE TABLE IF NOT EXISTS activity
(
    id UUID DEFAULT generateUUIDv4(),
    externalId String,
    title String,
    message String,
    replyTo String,
    reactTo String,
    inviteTo String,
    source String,
    activityTypeId UUID,
    channelId Nullable(UUID),
    eventId Nullable(UUID),
    memberId UUID,
    workspaceId UUID,
    createdAt DateTime DEFAULT now(),
    updatedAt DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY workspaceId
ORDER BY (workspaceId, createdAt);

CREATE TABLE IF NOT EXISTS activityType
(
    id UUID DEFAULT generateUUIDv4(),
    name String,
    key String,
    points UInt16,
    source String,
    conditions JSON,
    deletable Boolean DEFAULT false,
    workspaceId UUID,
    createdAt DateTime DEFAULT now(),
    updatedAt DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(updatedAt)
PARTITION BY workspaceId
ORDER BY (workspaceId, id);

CREATE TABLE IF NOT EXISTS channel
(
    id UUID DEFAULT generateUUIDv4(),
    externalId String,
    name String,
    source String,
    workspaceId UUID,
    createdAt DateTime DEFAULT now(),
    updatedAt DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY workspaceId
ORDER BY (workspaceId, id);

CREATE TABLE IF NOT EXISTS company
(
    id UUID DEFAULT generateUUIDv4(),
    name String,
    industry String,
    address String,
    domain String,
    employees Nullable(UInt32),
    foundedAt Nullable(DateTime),
    logoUrl String,
    tags Array(String) DEFAULT [],
    source String,
    workspaceId UUID,
    createdAt DateTime DEFAULT now(),
    updatedAt DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY workspaceId
ORDER BY (workspaceId, id);

CREATE TABLE IF NOT EXISTS level
(
    id UUID DEFAULT generateUUIDv4(),
    name String,
    number UInt8,
    from UInt16,
    to Nullable(UInt16),
    workspaceId UUID,
    createdAt DateTime DEFAULT now(),
    updatedAt DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY workspaceId
ORDER BY (workspaceId, id);

CREATE TABLE IF NOT EXISTS log
(
    id UUID DEFAULT generateUUIDv4(),
    date DateTime,
    pulse UInt32 DEFAULT 0,
    levelId Nullable(UUID),
    memberId UUID,
    workspaceId UUID
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (memberId, date);

CREATE TABLE IF NOT EXISTS member
(
    id UUID DEFAULT generateUUIDv4(),
    firstName String,
    lastName String,
    primaryEmail String,
    emails Array(String),
    phones Array(String),
    jobTitle String,
    avatarUrl String,
    country String,
    language String,
    tags Array(String),
    pulse Int32 DEFAULT 0,
    linkedinUrl String,
    isStaff Boolean DEFAULT false,
    source String,
    levelId Nullable(UUID),
    companyId Nullable(UUID),
    workspaceId UUID,
    firstActivity Nullable(DateTime),
    lastActivity Nullable(DateTime),
    createdAt DateTime DEFAULT now(),
    updatedAt DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(updatedAt)
PARTITION BY workspaceId
ORDER BY (workspaceId, id);

CREATE TABLE IF NOT EXISTS profile
(
    id UUID DEFAULT generateUUIDv4(),
    externalId String,
    attributes JSON,
    memberId UUID,
    workspaceId UUID,
    createdAt DateTime DEFAULT now(),
    updatedAt DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(updatedAt)
PARTITION BY workspaceId
ORDER BY (workspaceId, id);
