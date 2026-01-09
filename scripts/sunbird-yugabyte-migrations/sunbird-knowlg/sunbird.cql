CREATE KEYSPACE IF NOT EXISTS sunbird WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}  AND durable_writes = true;

CREATE TABLE IF NOT EXISTS sunbird.bulk_upload_process_task (
    processid text,
    sequenceid int,
    createdon timestamp,
    data text,
    failureresult text,
    iterationid int,
    lastupdatedon timestamp,
    status int,
    successresult text,
    PRIMARY KEY (processid, sequenceid)
) WITH CLUSTERING ORDER BY (sequenceid ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};


CREATE TABLE IF NOT EXISTS sunbird.assessment_item (
    id text PRIMARY KEY,
    answers text,
    assessmentitemid text,
    assessmenttype text,
    attempteddate text,
    attemptid text,
    contentid text,
    courseid text,
    createddate text,
    evaluationstatus boolean,
    maxscore text,
    processingstatus boolean,
    result text,
    score text,
    timetaken int,
    userid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_ai_contentid ON sunbird.assessment_item (contentid);
CREATE INDEX IF NOT EXISTS inx_ai_userid ON sunbird.assessment_item (userid);
CREATE INDEX IF NOT EXISTS inx_ai_assessmentitemid ON sunbird.assessment_item (assessmentitemid);
CREATE INDEX IF NOT EXISTS inx_ai_courseid ON sunbird.assessment_item (courseid);


CREATE TABLE IF NOT EXISTS sunbird.bulk_upload_process (
    id text PRIMARY KEY,
    createdby text,
    createdon timestamp,
    data text,
    failureresult text,
    lastupdatedon timestamp,
    objecttype text,
    organisationid text,
    processendtime text,
    processstarttime text,
    retrycount int,
    status int,
    storagedetails text,
    successresult text,
    taskcount int,
    telemetrycontext map<text, text>,
    uploadedby text,
    uploadeddate text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_status ON sunbird.bulk_upload_process (status);