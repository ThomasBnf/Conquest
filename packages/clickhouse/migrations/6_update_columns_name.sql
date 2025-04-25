SET allow_experimental_json_type=1;

CREATE TABLE IF NOT EXISTS Activity
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
ORDER BY (workspaceId, externalId, id, createdAt);

INSERT INTO Activity SELECT * FROM activity;

CREATE TABLE IF NOT EXISTS ActivityType
(
    id UUID DEFAULT generateUUIDv4(),
    name String,
    source String,
    key String,
    points UInt16,
    conditions JSON,
    deletable Boolean DEFAULT false,
    workspaceId UUID,
    createdAt DateTime DEFAULT now(),
    updatedAt DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(updatedAt)
PARTITION BY workspaceId
ORDER BY (workspaceId, id);

INSERT INTO ActivityType SELECT * FROM activity_type;

CREATE TABLE IF NOT EXISTS Channel
(
    id UUID DEFAULT generateUUIDv4(),
    externalId String,
    name String,
    slug String,
    source String,
    workspaceId UUID,
    createdAt DateTime DEFAULT now(),
    updatedAt DateTime DEFAULT now()
)
ENGINE = MergeTree()
PARTITION BY workspaceId
ORDER BY (workspaceId, externalId, id);

INSERT INTO Channel SELECT * FROM channel;

CREATE TABLE IF NOT EXISTS Company
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

INSERT INTO Company SELECT * FROM company;

CREATE TABLE IF NOT EXISTS Level
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

INSERT INTO Level SELECT * FROM level;

CREATE TABLE IF NOT EXISTS Log
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
ORDER BY (memberId, date, id);

INSERT INTO Log SELECT * FROM log;

CREATE TABLE IF NOT EXISTS Member
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
    source String,
    levelId Nullable(UUID),
    linkedinUrl String,
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

INSERT INTO Member SELECT * FROM member;

CREATE TABLE IF NOT EXISTS Profile
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
ORDER BY (workspaceId, memberId, id);

INSERT INTO Profile SELECT * FROM profile;
