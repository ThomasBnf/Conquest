SET allow_experimental_json_type=1;

ALTER TABLE company ADD COLUMN customFields JSON DEFAULT '{ "fields": [] }';