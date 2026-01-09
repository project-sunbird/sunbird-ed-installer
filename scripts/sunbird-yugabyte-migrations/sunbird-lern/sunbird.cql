
CREATE KEYSPACE IF NOT EXISTS sunbird WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}  AND durable_writes = true;

CREATE TABLE IF NOT EXISTS sunbird.assessment_eval (
    id text PRIMARY KEY,
    attemptedcount int,
    attemptid text,
    contentid text,
    courseid text,
    createddate text,
    result text,
    score text,
    userid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_ae_courseid ON sunbird.assessment_eval (courseid);
CREATE INDEX IF NOT EXISTS inx_ae_userid ON sunbird.assessment_eval (userid);
CREATE INDEX IF NOT EXISTS inx_ae_contentid ON sunbird.assessment_eval (contentid);

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
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.user_roles (
    userid text,
    role text,
    createdby text,
    createddate text,
    scope text,
    updatedby text,
    updateddate text,
    PRIMARY KEY (userid, role)
) WITH CLUSTERING ORDER BY (role ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.course_management (
    id text PRIMARY KEY,
    addedby text,
    addedbyname text,
    contentid text,
    contenttype text,
    courseduration text,
    courseid text,
    courselogourl text,
    coursename text,
    courserating text,
    coursetype text,
    createddate text,
    createdfor list<text>,
    description text,
    enrollementenddate text,
    enrollementstartdate text,
    facultyid text,
    facultyname text,
    nooflectures int,
    organisationid text,
    organisationname text,
    publishedby text,
    publishedbyname text,
    publisheddate text,
    status text,
    tocurl text,
    tutor map<text, text>,
    updatedby text,
    updatedbyname text,
    updateddate text,
    usercount int
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_cm_course_name ON sunbird.course_management (coursename);
CREATE INDEX IF NOT EXISTS inx_cm_courseid ON sunbird.course_management (courseid);
CREATE INDEX IF NOT EXISTS inx_cm_status ON sunbird.course_management (status);
CREATE INDEX IF NOT EXISTS inx_cm_contentid ON sunbird.course_management (contentid);
CREATE INDEX IF NOT EXISTS inx_cm_organisationid ON sunbird.course_management (organisationid);
CREATE INDEX IF NOT EXISTS inx_cm_facultyid ON sunbird.course_management (facultyid);

CREATE TABLE IF NOT EXISTS sunbird.user_group (
    userid text PRIMARY KEY,
    groupid set<text>
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.url_action (
    id text PRIMARY KEY,
    name text,
    url list<text>
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
// CREATE INDEX IF NOT EXISTS inx_ua_url ON sunbird.url_action (values(url));
CREATE INDEX IF NOT EXISTS inx_ua_name ON sunbird.url_action (name);

CREATE TABLE IF NOT EXISTS sunbird.user_auth (
    id text PRIMARY KEY,
    createddate text,
    source text,
    updateddate text,
    userid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_ua_userid ON sunbird.user_auth (userid);
CREATE INDEX IF NOT EXISTS inx_ua_source ON sunbird.user_auth (source);

CREATE TABLE IF NOT EXISTS sunbird.user_organisation (
    userid text,
    organisationid text,
    addedby text,
    addedbyname text,
    approvaldate text,
    approvedby text,
    associationtype int,
    hashtagid text,
    id text,
    isapproved boolean,
    isdeleted boolean,
    isrejected boolean,
    orgjoindate text,
    orgleftdate text,
    position text,
    roles list<text>,
    updatedby text,
    updateddate text,
    PRIMARY KEY (userid, organisationid)
) WITH CLUSTERING ORDER BY (organisationid ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.user_consent (
    user_id text,
    consumer_id text,
    object_id text,
    categories list<text>,
    consent_data text,
    consumer_type text,
    created_on timestamp,
    expiry timestamp,
    id text,
    last_updated_on timestamp,
    object_type text,
    status text,
    PRIMARY KEY (user_id, consumer_id, object_id)
) WITH CLUSTERING ORDER BY (consumer_id ASC, object_id ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.system_settings (
    id text PRIMARY KEY,
    field text,
    value text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.client_info (
    id text PRIMARY KEY,
    channel text,
    clientname text,
    createddate text,
    masterkey text,
    updateddate text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_ci_clientname ON sunbird.client_info (clientname);
CREATE INDEX IF NOT EXISTS inx_ci_clientchannel ON sunbird.client_info (channel);

CREATE TABLE IF NOT EXISTS sunbird.user (
    id text PRIMARY KEY,
    alltncaccepted map<text, text>,
    channel text,
    countrycode text,
    createdby text,
    createddate text,
    dob text,
    email text,
    emailverified boolean,
    firstname text,
    flagsvalue int,
    framework map<text, frozen<list<text>>>,
    isdeleted boolean,
    lastname text,
    locationids list<text>,
    loginid text,
    managedby text,
    maskedemail text,
    maskedphone text,
    phone text,
    phoneverified boolean,
    prevusedemail text,
    prevusedphone text,
    profiledetails text,
    profilelocation text,
    profileusertype text,
    profileusertypes text,
    recoveryemail text,
    recoveryphone text,
    roles list<text>,
    rootorgid text,
    status int,
    tncacceptedon timestamp,
    tncacceptedversion text,
    updatedby text,
    updateddate text,
    userid text,
    username text,
    usersubtype text,
    usertype text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.group_member (
    groupid text,
    userid text,
    createdby text,
    createdon timestamp,
    removedby text,
    removedon timestamp,
    role text,
    status text,
    updatedby text,
    updatedon timestamp,
    PRIMARY KEY (groupid, userid)
) WITH CLUSTERING ORDER BY (userid ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS idx_group_member_status ON sunbird.group_member (status);

CREATE TABLE IF NOT EXISTS sunbird.subject (
    id text PRIMARY KEY,
    name text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_sb_name ON sunbird.subject (name);

CREATE TABLE IF NOT EXISTS sunbird.content_consumption (
    id text PRIMARY KEY,
    batchid text,
    completedcount int,
    contentid text,
    contentversion text,
    courseid text,
    datetime timestamp,
    grade text,
    lastaccesstime text,
    lastcompletedtime text,
    lastupdatedtime text,
    progress int,
    result text,
    score text,
    status int,
    userid text,
    viewcount int
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_cc_contentid ON sunbird.content_consumption (contentid);
CREATE INDEX IF NOT EXISTS inx_cc_courseid ON sunbird.content_consumption (courseid);
CREATE INDEX IF NOT EXISTS inx_cc_status ON sunbird.content_consumption (status);
CREATE INDEX IF NOT EXISTS inx_cc_userid ON sunbird.content_consumption (userid);

CREATE TABLE IF NOT EXISTS sunbird.group (
    id text PRIMARY KEY,
    activities list<frozen<map<text, text>>>,
    createdby text,
    createdon timestamp,
    description text,
    membershiptype text,
    name text,
    status text,
    updatedby text,
    updatedon timestamp
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS idx_group_status ON sunbird.group (status);

CREATE TABLE IF NOT EXISTS sunbird.user_lookup (
    type text,
    value text,
    userid text,
    PRIMARY KEY ((type, value))
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.role_group (
    id text PRIMARY KEY,
    name text,
    url_action_ids list<text>
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.organisation (
    id text PRIMARY KEY,
    channel text,
    contactdetail text,
    createdby text,
    createddate text,
    description text,
    email text,
    externalid text,
    hashtagid text,
    homeurl text,
    imgurl text,
    isrootorg boolean,
    isssoenabled boolean,
    istenant boolean,
    keys map<text, frozen<list<text>>>,
    locationids list<text>,
    organisationsubtype int,
    organisationtype int,
    orglocation text,
    orgname text,
    provider text,
    rootorgid text,
    slug text,
    status int,
    updatedby text,
    updateddate text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
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
    AND dclocal_read_repair_chance = 0.1
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

CREATE TABLE IF NOT EXISTS sunbird.user_badge_assertion (
    id text PRIMARY KEY,
    assertionid text,
    badgeclassimage text,
    badgeclassname text,
    badgeid text,
    createdts timestamp,
    issuerid text,
    userid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.user_skills (
    id text PRIMARY KEY,
    createdby text,
    createdon timestamp,
    endorsementcount int,
    endorserslist frozen<list<frozen<map<text, text>>>>,
    lastupdatedby text,
    lastupdatedon timestamp,
    skillname text,
    skillnametolowercase text,
    userid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_us_userid ON sunbird.user_skills (userid);

CREATE TABLE IF NOT EXISTS sunbird.geo_location (
    id text PRIMARY KEY,
    createdby text,
    createddate text,
    location text,
    rootorgid text,
    topic text,
    type text,
    updatedby text,
    updateddate text,
    usercount int,
    usercountttl text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_gl_rootorgid ON sunbird.geo_location (rootorgid);

CREATE TABLE IF NOT EXISTS sunbird.role (
    id text PRIMARY KEY,
    name text,
    rolegroupid list<text>,
    status int
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.location (
    id text PRIMARY KEY,
    code text,
    name text,
    parentid text,
    type text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.user_org (
    id text PRIMARY KEY,
    addedby text,
    addedbyname text,
    approvaldate text,
    approvedby text,
    hashtagid text,
    isapproved boolean,
    isdeleted boolean,
    isrejected boolean,
    organisationid text,
    orgjoindate text,
    orgleftdate text,
    position text,
    roles list<text>,
    updatedby text,
    updateddate text,
    userid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_uorg_userid ON sunbird.user_org (userid);
CREATE INDEX IF NOT EXISTS inx_uorg_orgid ON sunbird.user_org (organisationid);

CREATE TABLE IF NOT EXISTS sunbird.media_type (
    id text PRIMARY KEY,
    name text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.badge (
    id text PRIMARY KEY,
    description text,
    isactive boolean,
    name text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.master_action (
    id text PRIMARY KEY,
    name text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_ma_name ON sunbird.master_action (name);

CREATE TABLE IF NOT EXISTS sunbird.badge_class_extension (
    id text PRIMARY KEY,
    issuerid text,
    roles list<text>,
    rootorgid text,
    subtype text,
    type text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.cassandra_migration_version (
    version text PRIMARY KEY,
    checksum int,
    description text,
    execution_time int,
    installed_by text,
    installed_on timestamp,
    installed_rank int,
    script text,
    success boolean,
    type text,
    version_rank int
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.page_management (
    id text PRIMARY KEY,
    appmap text,
    created_date timestamp,
    createdby text,
    createddate text,
    name text,
    organisationid text,
    portalmap text,
    updated_date timestamp,
    updatedby text,
    updateddate text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.course_enrollment (
    id text PRIMARY KEY,
    active boolean,
    addedby text,
    contentid text,
    courseid text,
    courselogourl text,
    coursename text,
    datetime timestamp,
    delta text,
    description text,
    enrolleddate text,
    grade text,
    lastreadcontentid text,
    lastreadcontentstatus int,
    progress int,
    status int,
    tocurl text,
    userid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_ce_userid ON sunbird.course_enrollment (userid);
CREATE INDEX IF NOT EXISTS inx_ce_course_name ON sunbird.course_enrollment (coursename);
CREATE INDEX IF NOT EXISTS inx_ce_status ON sunbird.course_enrollment (status);
CREATE INDEX IF NOT EXISTS inx_ce_courseid ON sunbird.course_enrollment (courseid);

CREATE TABLE IF NOT EXISTS sunbird.org_external_identity (
    provider text,
    externalid text,
    orgid text,
    PRIMARY KEY (provider, externalid)
) WITH CLUSTERING ORDER BY (externalid ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.email_template (
    name text PRIMARY KEY,
    createdby text,
    createdon timestamp,
    lastupdatedby text,
    lastupdatedon timestamp,
    template text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.usr_external_identity (
    provider text,
    idtype text,
    externalid text,
    createdby text,
    createdon timestamp,
    lastupdatedby text,
    lastupdatedon timestamp,
    originalexternalid text,
    originalidtype text,
    originalprovider text,
    userid text,
    PRIMARY KEY (provider, idtype, externalid)
) WITH CLUSTERING ORDER BY (idtype ASC, externalid ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_usrextid_user_id ON sunbird.usr_external_identity (userid);

CREATE TABLE IF NOT EXISTS sunbird.tenant_preference_v2 (
    orgid text,
    key text,
    createdby text,
    createdon timestamp,
    data text,
    updatedby text,
    updatedon timestamp,
    PRIMARY KEY (orgid, key)
) WITH CLUSTERING ORDER BY (key ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.cert_registry (
    id text PRIMARY KEY,
    accesscode text,
    createdat timestamp,
    createdby text,
    data text,
    isrevoked boolean,
    jsonurl text,
    pdfurl text,
    reason text,
    recipient text,
    related text,
    updatedat timestamp,
    updatedby text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.user_job_profile (
    id text PRIMARY KEY,
    addressid text,
    boardname text,
    createdby text,
    createddate text,
    enddate text,
    iscurrentjob boolean,
    isdeleted boolean,
    isrejected boolean,
    isverified boolean,
    jobname text,
    joiningdate text,
    orgid text,
    orgname text,
    role text,
    subject list<text>,
    updatedby text,
    updateddate text,
    userid text,
    verifiedby text,
    verifieddate text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_ujp_userid ON sunbird.user_job_profile (userid);

CREATE TABLE IF NOT EXISTS sunbird.user_declarations (
    userid text,
    orgid text,
    persona text,
    createdby text,
    createdon timestamp,
    errortype text,
    status text,
    updatedby text,
    updatedon timestamp,
    userinfo map<text, text>,
    PRIMARY KEY (userid, orgid, persona)
) WITH CLUSTERING ORDER BY (orgid ASC, persona ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

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
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_status ON sunbird.bulk_upload_process (status);

CREATE TABLE IF NOT EXISTS sunbird.address (
    id text PRIMARY KEY,
    addressline1 text,
    addressline2 text,
    addtype text,
    city text,
    country text,
    createdby text,
    createddate text,
    isdeleted boolean,
    state text,
    updatedby text,
    updateddate text,
    userid text,
    zipcode text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.otp (
    type text,
    key text,
    attemptedcount int,
    createdon timestamp,
    otp text,
    PRIMARY KEY (type, key)
) WITH CLUSTERING ORDER BY (key ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.report_tracking (
    id text PRIMARY KEY,
    createddate text,
    data text,
    email text,
    fileurl text,
    firstname text,
    format text,
    period text,
    resourceid text,
    resourcename text,
    status int,
    trycount int,
    type text,
    updateddate text,
    uploadeddate text,
    userid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_report_tracking_userid ON sunbird.report_tracking (userid);
CREATE INDEX IF NOT EXISTS inx_report_tracking_status ON sunbird.report_tracking (status);

CREATE TABLE IF NOT EXISTS sunbird.user_external_identity (
    id text PRIMARY KEY,
    createdby text,
    createdon timestamp,
    externalid text,
    lastupdatedby text,
    lastupdatedon timestamp,
    provider text,
    userid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_uei_userid ON sunbird.user_external_identity (userid);
CREATE INDEX IF NOT EXISTS inx_uei_externalid ON sunbird.user_external_identity (externalid);
CREATE INDEX IF NOT EXISTS inx_uei_provider ON sunbird.user_external_identity (provider);

CREATE TABLE IF NOT EXISTS sunbird.user_courses (
    id text PRIMARY KEY,
    active boolean,
    addedby text,
    batchid text,
    completedon timestamp,
    contentid text,
    courseid text,
    courselogourl text,
    coursename text,
    datetime timestamp,
    delta text,
    description text,
    enrolleddate text,
    grade text,
    lastreadcontentid text,
    lastreadcontentstatus int,
    leafnodescount int,
    processingstatus text,
    progress int,
    status int,
    tocurl text,
    userid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_ucs_batchid ON sunbird.user_courses (batchid);
CREATE INDEX IF NOT EXISTS inx_ucs_courseid ON sunbird.user_courses (courseid);
CREATE INDEX IF NOT EXISTS inx_ucs_status ON sunbird.user_courses (status);
CREATE INDEX IF NOT EXISTS inx_ucs_course_name ON sunbird.user_courses (coursename);
CREATE INDEX IF NOT EXISTS inx_ucs_userid ON sunbird.user_courses (userid);

CREATE TABLE IF NOT EXISTS sunbird.tenant_preference (
    id text PRIMARY KEY,
    data text,
    key text,
    orgid text,
    role text,
    tenantname text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_tp_key ON sunbird.tenant_preference (key);
CREATE INDEX IF NOT EXISTS inx_tp_userid ON sunbird.tenant_preference (orgid);

CREATE TABLE IF NOT EXISTS sunbird.shadow_user (
    channel text,
    userextid text,
    addedby text,
    attemptedcount int,
    claimedon timestamp,
    claimstatus int,
    createdon timestamp,
    email text,
    name text,
    orgextid text,
    phone text,
    processid text,
    updatedon timestamp,
    userid text,
    userids list<text>,
    userstatus int,
    PRIMARY KEY (channel, userextid)
) WITH CLUSTERING ORDER BY (userextid ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_shausr_userextid ON sunbird.shadow_user (userextid);
CREATE INDEX IF NOT EXISTS inx_shausr_userstatus ON sunbird.shadow_user (userstatus);
// CREATE INDEX IF NOT EXISTS shadow_user_userids_idx ON sunbird.shadow_user (values(userids));
CREATE INDEX IF NOT EXISTS inx_shausr_claimstatus ON sunbird.shadow_user (claimstatus);
CREATE INDEX IF NOT EXISTS inx_shausr_userid ON sunbird.shadow_user (userid);
CREATE INDEX IF NOT EXISTS inx_shausr_processid ON sunbird.shadow_user (processid);
CREATE INDEX IF NOT EXISTS inx_shausr_orgextid ON sunbird.shadow_user (orgextid);

CREATE TABLE IF NOT EXISTS sunbird.user_action_role (
    id text PRIMARY KEY,
    actiongroupid list<text>,
    roleid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.user_cert (
    id text PRIMARY KEY,
    accesscode text,
    createdat timestamp,
    isdeleted boolean,
    oldid text,
    store map<text, text>,
    updatedat timestamp,
    userid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_usrcert_user_id ON sunbird.user_cert (userid);

CREATE TABLE IF NOT EXISTS sunbird.cassandra_migration_version_counts (
    name text PRIMARY KEY,
    count counter
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.skills (
    id text PRIMARY KEY,
    skills list<text>
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.user_feed (
    id text PRIMARY KEY,
    category text,
    createdby text,
    createdon timestamp,
    data text,
    expireon timestamp,
    priority int,
    status text,
    updatedby text,
    updatedon timestamp,
    userid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS user_feed_category_idx ON sunbird.user_feed (category);
CREATE INDEX IF NOT EXISTS user_feed_userid_idx ON sunbird.user_feed (userid);

CREATE TABLE IF NOT EXISTS sunbird.rate_limit (
    key text,
    unit text,
    count int,
    rate int,
    PRIMARY KEY (key, unit)
) WITH CLUSTERING ORDER BY (unit ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.course_publish_status (
    id text PRIMARY KEY,
    status int,
    submitdate text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_cps_status ON sunbird.course_publish_status (status);

CREATE TABLE IF NOT EXISTS sunbird.action_group (
    id text PRIMARY KEY,
    actionid list<text>,
    groupname text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.course_batch (
    id text PRIMARY KEY,
    countdecrementdate text,
    countdecrementstatus boolean,
    countincrementdate text,
    countincrementstatus boolean,
    courseadditionalinfo map<text, text>,
    coursecreator text,
    courseid text,
    createdby text,
    createddate text,
    createdfor list<text>,
    description text,
    enddate text,
    enrollmentenddate text,
    enrollmenttype text,
    hashtagid text,
    mentors list<text>,
    name text,
    startdate text,
    status int,
    updateddate text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_cou_bat_coursecreator ON sunbird.course_batch (coursecreator);
CREATE INDEX IF NOT EXISTS inx_cou_bat_courseid ON sunbird.course_batch (courseid);
CREATE INDEX IF NOT EXISTS inx_cou_bat_status ON sunbird.course_batch (status);
CREATE INDEX IF NOT EXISTS inx_cou_bat_createdby ON sunbird.course_batch (createdby);
CREATE INDEX IF NOT EXISTS inx_cou_bat_enrolmenttype ON sunbird.course_batch (enrollmenttype);

CREATE TABLE IF NOT EXISTS sunbird.user_notes (
    id text PRIMARY KEY,
    contentid text,
    courseid text,
    createdby text,
    createddate text,
    isdeleted boolean,
    note text,
    tags list<text>,
    title text,
    updatedby text,
    updateddate text,
    userid text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.user_education (
    id text PRIMARY KEY,
    addressid text,
    boardoruniversity text,
    coursename text,
    createdby text,
    createddate text,
    degree text,
    duration int,
    grade text,
    isdeleted boolean,
    name text,
    percentage double,
    updatedby text,
    updateddate text,
    userid text,
    yearofpassing int
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_ueu_userid ON sunbird.user_education (userid);

CREATE TABLE IF NOT EXISTS sunbird.content_badge_association (
    id text PRIMARY KEY,
    badgeclassimage text,
    badgeclassname text,
    badgeid text,
    contentid text,
    createdby text,
    createdon timestamp,
    issuerid text,
    lastupdatedby text,
    lastupdatedon timestamp,
    status int
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

CREATE TABLE IF NOT EXISTS sunbird.user_badge (
    id text PRIMARY KEY,
    badgetypeid text,
    createdby text,
    createddate text,
    description text,
    expirydate text,
    image text,
    isexpired boolean,
    isrevoked boolean,
    isverified boolean,
    provideremail text,
    providerid text,
    providername text,
    providerphone text,
    receiveddate text,
    receiverid text,
    revocationdate text,
    revocationreason text,
    revokedby text,
    updatedby text,
    updateddate text,
    validitydate int,
    verifiedby text,
    verifieddate text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_usr_badg_receiverid ON sunbird.user_badge (receiverid);
CREATE INDEX IF NOT EXISTS inx_usr_badg ON sunbird.user_badge (badgetypeid);

CREATE TABLE IF NOT EXISTS sunbird.config_path_audit (
    id text,
    cloud_store_type text,
    created_date bigint,
    cloud_store_account text,
    cloud_store_container text,
    cloud_store_path text,
    version bigint,
    PRIMARY KEY ((id, cloud_store_type), created_date)
) WITH CLUSTERING ORDER BY (created_date DESC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};
CREATE INDEX IF NOT EXISTS inx_created_date ON sunbird.config_path_audit (created_date);

CREATE TABLE IF NOT EXISTS sunbird.page_section (
    id text PRIMARY KEY,
    alt text,
    created_date timestamp,
    createdby text,
    createddate text,
    datasource text,
    description text,
    display text,
    dynamicfilters text,
    imgurl text,
    name text,
    searchquery text,
    sectiondatatype text,
    status int,
    updated_date timestamp,
    updatedby text,
    updateddate text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND compression = {'chunk_length_in_kb': '64', 'class': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND crc_check_chance = 1.0
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99PERCENTILE'
    AND transactions = {'enabled': 'true'};

