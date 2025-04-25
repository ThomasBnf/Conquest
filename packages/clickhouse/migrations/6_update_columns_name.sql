CREATE TABLE IF NOT EXISTS newActivity
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

INSERT INTO newActivity SELECT * FROM activity;

RENAME TABLE activity TO activity_old;
RENAME TABLE newActivity TO activity;

DROP TABLE activity_old;




CREATE TABLE IF NOT EXISTS newActivityType
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

INSERT INTO newActivityType SELECT * FROM activity_type;

RENAME TABLE activity_type TO activityType_old;
RENAME TABLE newActivityType TO activityType;

DROP TABLE activityType_old;

CREATE TABLE IF NOT EXISTS newChannel
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

INSERT INTO newChannel SELECT * FROM channel;

RENAME TABLE channel TO channel_old;
RENAME TABLE newChannel TO channel;

DROP TABLE channel_old;

CREATE TABLE IF NOT EXISTS newCompany
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

INSERT INTO newCompany SELECT * FROM company;

RENAME TABLE company TO company_old;
RENAME TABLE newCompany TO company;

DROP TABLE company_old;

CREATE TABLE IF NOT EXISTS newLevel
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

INSERT INTO newLevel SELECT * FROM level;

RENAME TABLE level TO level_old;
RENAME TABLE newLevel TO level;

DROP TABLE level_old;

CREATE TABLE IF NOT EXISTS newLog
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

INSERT INTO newLog SELECT * FROM log;

RENAME TABLE log TO log_old;
RENAME TABLE newLog TO log;

DROP TABLE log_old;

CREATE TABLE IF NOT EXISTS newMember
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

INSERT INTO newMember SELECT * FROM member;

RENAME TABLE member TO member_old;
RENAME TABLE newMember TO member;

DROP TABLE member_old;

CREATE TABLE IF NOT EXISTS newProfile
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

INSERT INTO newProfile SELECT * FROM profile;

RENAME TABLE profile TO profile_old;
RENAME TABLE newProfile TO profile;

DROP TABLE profile_old;