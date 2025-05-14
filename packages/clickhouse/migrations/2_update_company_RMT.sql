CREATE TABLE IF NOT EXISTS _company
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
ENGINE = ReplacingMergeTree()
PARTITION BY workspaceId
ORDER BY (workspaceId, id);

INSERT INTO _company SELECT * FROM company;
RENAME TABLE company TO company_old;
RENAME TABLE _company TO company;
DROP TABLE company_old;