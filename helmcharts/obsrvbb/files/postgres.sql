\c analytics;

-- Table: dev_report_config
CREATE TABLE IF NOT EXISTS {{ .Values.global.env }}_report_config (
    report_id SERIAL PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_report_name ON {{ .Values.global.env }}_report_config (report_name);

---Table dev_report_config
-- CREATE TABLE
CREATE TABLE IF NOT EXISTS {{ .Values.global.env }}_report_config (
    report_id          TEXT PRIMARY KEY,
    updated_on         TIMESTAMPTZ,
    report_description TEXT,
    requested_by       TEXT,
    report_schedule    TEXT,
    config             JSON,
    created_on         TIMESTAMPTZ,
    submitted_on       TIMESTAMPTZ,
    status             TEXT,
    status_msg         TEXT
);


-- Table: dev_job_request
CREATE TABLE IF NOT EXISTS {{ .Values.global.env }}_job_request (
    tag VARCHAR(100),
    request_id VARCHAR(50),
    job_id VARCHAR(50),
    status VARCHAR(50),
    request_data json,
    requested_by VARCHAR(50),
    requested_channel VARCHAR(50),
    dt_job_submitted TIMESTAMP,
    download_urls text[],
    dt_file_created TIMESTAMP,
    dt_job_completed TIMESTAMP,
    execution_time INTEGER,
    err_message VARCHAR(300),
    iteration INTEGER,
    encryption_key VARCHAR(50),
    PRIMARY KEY (tag, request_id)
);

ALTER TABLE {{ .Values.global.env }}_job_request
ADD COLUMN IF NOT EXISTS batch_number INTEGER;
ALTER TABLE {{ .Values.global.env }}_job_request
ADD COLUMN IF NOT EXISTS processed_batches text;
ALTER TABLE {{ .Values.global.env }}_job_request
ALTER COLUMN encryption_key TYPE varchar(500);

-- Table: dev_experiment_definition
CREATE TABLE IF NOT EXISTS {{ .Values.global.env }}_experiment_definition (
    experiment_id SERIAL PRIMARY KEY,
    experiment_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_experiment_name ON {{ .Values.global.env }}_experiment_definition (experiment_name);

-- Table: dev_dataset_metadata
CREATE TABLE IF NOT EXISTS {{ .Values.global.env }}_dataset_metadata (
    dataset_id SERIAL PRIMARY KEY,
    dataset_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_dataset_name ON {{ .Values.global.env }}_dataset_metadata (dataset_name);

ALTER TABLE {{ .Values.global.env }}_dataset_metadata
ADD COLUMN IF NOT EXISTS dataset_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS dataset_sub_id VARCHAR(150),
ADD COLUMN IF NOT EXISTS dataset_config JSON,
ADD COLUMN IF NOT EXISTS visibility VARCHAR(50),
ADD COLUMN IF NOT EXISTS dataset_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS version VARCHAR(10),
ADD COLUMN IF NOT EXISTS authorized_roles TEXT[],
ADD COLUMN IF NOT EXISTS available_from TIMESTAMP,
ADD COLUMN IF NOT EXISTS sample_request TEXT,
ADD COLUMN IF NOT EXISTS sample_response TEXT,
ADD COLUMN IF NOT EXISTS validation_json JSON,
ADD COLUMN IF NOT EXISTS druid_query JSON,
ADD COLUMN IF NOT EXISTS limits JSON,
ADD COLUMN IF NOT EXISTS supported_formats TEXT[],
ADD COLUMN IF NOT EXISTS exhaust_type VARCHAR(50);


----Table:  {{ .Values.global.env }}__consumer_channel_mapping
-- CREATE TABLE
CREATE TABLE IF NOT EXISTS {{ .Values.global.env }}_consumer_channel_mapping (
    consumer_id   TEXT,
    channel       TEXT,
    status        SMALLINT,
    created_by    TEXT,
    created_on    TIMESTAMPTZ,
    updated_on    TIMESTAMPTZ,
    PRIMARY KEY (consumer_id, channel)
);

-- INSERT STATEMENT
INSERT INTO {{ .Values.global.env }}_consumer_channel_mapping (
    consumer_id,
    channel,
    status,
    created_by,
    created_on,
    updated_on
) VALUES (
    'id',
    'channel_id',
      1,
    'analytics-team',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT ON CONSTRAINT {{ .Values.global.env }}_consumer_channel_mapping_pkey
DO UPDATE SET
    status = EXCLUDED.status,
    updated_on = CURRENT_TIMESTAMP;

---Table dev_report_config
-- CREATE TABLE
CREATE TABLE IF NOT EXISTS {{ .Values.global.env }}_report_config (
    report_id          TEXT PRIMARY KEY,
    updated_on         TIMESTAMPTZ,
    report_description TEXT,
    requested_by       TEXT,
    report_schedule    TEXT,
    config             JSON,
    created_on         TIMESTAMPTZ,
    submitted_on       TIMESTAMPTZ,
    status             TEXT,
    status_msg         TEXT
);

ALTER TABLE {{ .Values.global.env }}_report_config 
ADD COLUMN IF NOT EXISTS batch_number INTEGER;

-- ALTER TABLE (Add Column batch_number)


---Table dev_experiment_definition
-- CREATE TABLE
CREATE TABLE IF NOT EXISTS {{ .Values.global.env }}_experiment_definition (
    exp_id            VARCHAR(50) PRIMARY KEY,
    created_by        VARCHAR(50),
    created_on        TIMESTAMP,
    criteria          VARCHAR(100),
    exp_data          VARCHAR(300),
    exp_description   VARCHAR(200),
    exp_name          VARCHAR(50),
    stats             VARCHAR(300),
    status            VARCHAR(50),
    status_message    VARCHAR(50),
    updated_by        VARCHAR(50),
    updated_on        TIMESTAMP
);

-- {{ .Values.global.env }}_{{ .Values.global.env }}ice_profile Table
CREATE TABLE IF NOT EXISTS {{ .Values.global.env }}_{{ .Values.global.env }}ice_profile (
    {{ .Values.global.env }}ice_id text PRIMARY KEY,
    api_last_updated_on timestamptz,
    avg_ts float,
    city text,

    country text,
    country_code text,
    {{ .Values.global.env }}ice_spec json,
    district_custom text,
    fcm_token text,
    first_access timestamptz,
    last_access timestamptz,
    producer_id text,
    state text,
    state_code text,
    state_code_custom text,
    state_custom text,
    total_launches bigint,
    total_ts float,
    uaspec json,
    updated_date timestamptz,
    user_declared_district text,
    user_declared_state text,
    user_declared_on timestamptz
);

-- report Table
CREATE TABLE IF NOT EXISTS report (
    reportid varchar(40) PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    authorizedroles jsonb NOT NULL,
    status varchar(8) DEFAULT 'draft' CHECK (status IN ('live', 'draft', 'retired')),
    type varchar(8) DEFAULT 'private' CHECK (type IN ('public', 'private')),
    reportaccessurl text UNIQUE,
    createdon timestamptz DEFAULT now() NOT NULL,
    updatedon timestamptz DEFAULT now() NOT NULL,
    createdby varchar(50) NOT NULL,
    reportconfig jsonb NOT NULL,
    templateurl text,
    slug varchar(10) NOT NULL,
    reportgenerateddate timestamptz DEFAULT now() NOT NULL,
    reportduration jsonb DEFAULT jsonb_build_object('startDate', now()::timestamptz, 'endDate', now()::timestamptz) NOT NULL,
    tags jsonb NOT NULL,
    parameters jsonb
);

-- report_summary Table
CREATE TABLE IF NOT EXISTS report_summary (
    id varchar(40) PRIMARY KEY,
    reportid varchar(40) NOT NULL,
    chartid text,
    createdon timestamptz DEFAULT now() NOT NULL,
    createdby varchar(50) NOT NULL,
    summary text NOT NULL,
    param_hash text
);

-- report_status Table
CREATE TABLE IF NOT EXISTS report_status (
    reportid varchar(40) NOT NULL REFERENCES report(reportid) ON DELETE CASCADE,
    hashed_val text NOT NULL,
    status varchar(8) DEFAULT 'draft' CHECK (status IN ('live', 'draft', 'retired')),
    PRIMARY KEY (reportid, hashed_val)
);

-- Alterations
ALTER TABLE report ADD COLUMN IF NOT EXISTS parameters jsonb;
ALTER TABLE report ADD COLUMN IF NOT EXISTS report_type varchar(8) DEFAULT 'report' NOT NULL;
ALTER TABLE report_summary ADD COLUMN IF NOT EXISTS param_hash text;
ALTER TABLE report ADD COLUMN IF NOT EXISTS accesspath jsonb;
ALTER TABLE report DROP CONSTRAINT IF EXISTS report_type_check;
ALTER TABLE report ADD CONSTRAINT report_type_check CHECK (type IN ('public', 'private', 'protected'));
ALTER TABLE report ALTER COLUMN type TYPE varchar(10);



-- superset
CREATE DATABASE superset;


---- dataproducts helm chart 
