CREATE TABLE IF NOT EXISTS member_replacing_merge_tree
(
    id UUID DEFAULT generateUUIDv4(),
    first_name String,
    last_name String,
    primary_email String,
    secondary_emails Array(String),
    phones Array(String),
    job_title String,
    avatar_url String,
    country String,
    language String,
    tags Array(String),
    pulse Int32 DEFAULT 0,
    source String,
    level_id Nullable(UUID),
    linkedin_url String,
    company_id Nullable(UUID),
    workspace_id UUID,
    first_activity Nullable(DateTime),
    last_activity Nullable(DateTime),
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(updated_at)
PARTITION BY workspace_id
ORDER BY (workspace_id, id);

INSERT INTO member_replacing_merge_tree SELECT * FROM member;

RENAME TABLE member TO member_old;
RENAME TABLE member_replacing_merge_tree TO member;

DROP TABLE member_old;
