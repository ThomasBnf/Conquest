CREATE TABLE IF NOT EXISTS task
(
    id UUID DEFAULT generateUUIDv4(),
    title String,
    dueDate DateTime,
    assignee String,
    isCompleted Boolean,
    memberId Nullable(UUID),
    workspaceId UUID,
    createdAt DateTime DEFAULT now(),
    updatedAt DateTime DEFAULT now()
)
ENGINE = ReplacingMergeTree()
PARTITION BY workspaceId
ORDER BY (workspaceId, id);

ALTER TABLE member ADD COLUMN atRiskMember Boolean DEFAULT false;
ALTER TABLE member ADD COLUMN potentialAmbassador Boolean DEFAULT false;