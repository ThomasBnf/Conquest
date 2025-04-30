CREATE TABLE IF NOT EXISTS _channel
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
ORDER BY (workspace_id, id);

INSERT INTO _channel SELECT * FROM channel;

