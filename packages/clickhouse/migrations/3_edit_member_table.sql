SET allow_experimental_json_type=1;

ALTER TABLE member ADD COLUMN customFields JSON DEFAULT '{ "fields": [] }';
ALTER TABLE member ADD COLUMN atRiskMember Boolean DEFAULT false;
ALTER TABLE member ADD COLUMN potentialAmbassador Boolean DEFAULT false;