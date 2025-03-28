ALTER TABLE activity
MODIFY COLUMN event_id Nullable(UUID);

OPTIMIZE TABLE activity FINAL;