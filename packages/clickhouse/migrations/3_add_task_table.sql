SET allow_experimental_json_type=1;

CREATE TABLE IF NOT EXISTS task
(
    id UUID DEFAULT generateUUIDv4(),
    title String,
    dueDate DateTime,
    assignee String,
    isCompleted Boolean DEFAULT false,
    memberId Nullable(UUID),
    workspaceId UUID,
    createdAt DateTime DEFAULT now(),
    updatedAt DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree(updatedAt)
PARTITION BY workspaceId
ORDER BY (workspaceId, id);