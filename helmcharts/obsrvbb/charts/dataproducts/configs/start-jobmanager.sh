#!/usr/bin/env bash
DATA_DIR=/data/analytics/logs/data-products
[[ -d $DATA_DIR ]] || mkdir -p $DATA_DIR
SERVICE_LOGS=/data/analytics/logs/services
[[ -d $SERVICE_LOGS ]] || mkdir -p $SERVICE_LOGS
export SPARK_HOME={{ .Values.global.spark_home }}
export MODELS_HOME={{ .Values.analytics_home }}/models-2.0
export DP_LOGS=$DATA_DIR
export SERVICE_LOGS=$SERVICE_LOGS
export JM_HOME={{ .Values.analytics_home }}/job-manager

export azure_storage_key="{{ .Values.global.cloud_storage_access_key }}"
export azure_storage_secret="{{ .Values.global.cloud_storage_secret_key }}"
export reports_azure_storage_key="{{ .Values.global.cloud_storage_access_key }}"
export reports_azure_storage_secret="{{ .Values.global.cloud_storage_secret_key }}"
export druid_storage_account_key="{{ .Values.global.cloud_storage_access_key }}"
export druid_storage_account_secret="{{ .Values.global.cloud_storage_secret_key }}"
export gcloud_storage_key="{{ .Values.global.cloud_storage_access_key }}"
export gcloud_storage_secret="{{ .Values.global.cloud_storage_secret_key }}"

export heap_conf_str="-XX:+UseG1GC -XX:MaxGCPauseMillis=100 -Xms250m -Xmx5120m -XX:+UseStringDeduplication"
today=$(date "+%Y-%m-%d")

kill_job_manager()
{
    echo "Killing currently running job-manager process" >> "$SERVICE_LOGS/$today-job-manager.log"
    kill $(ps aux | grep 'JobManager' | awk '{print $2}') >> "$SERVICE_LOGS/$today-job-manager.log"
}

start_job_manager()
{
    kill_job_manager # Before starting the job, We are killing the job-manager
    cd {{ .Values.analytics_home }}/scripts
    source model-config.sh
    job_config=$(config 'job-manager')
    echo "Starting the job manager" >> "$SERVICE_LOGS/$today-job-manager.log"
    echo "config: $job_config" >> "$SERVICE_LOGS/$today-job-manager.log"
    nohup java $heap_conf_str -cp "$SPARK_HOME/jars/*:$MODELS_HOME/*:$MODELS_HOME/data-products-1.0/lib/*" '-Dconfig.file=/data/analytics/scripts/common.conf' org.ekstep.analytics.job.JobManager --config "$job_config" >> $SERVICE_LOGS/$today-job-manager.log 2>&1 &
    
    job_manager_pid=$(ps aux | grep 'JobManager' | awk '{print $2}') # Once Job is started just we are making whether job is running or not.
    if [[ ! -z "$job_manager_pid" ]]; then
        echo "Job manager is started." >> "$SERVICE_LOGS/$today-job-manager.log"
    else
        echo "Job manager is not started." >> "$SERVICE_LOGS/$today-job-manager.log"
    fi
}
# Tasks
# Kill the job-manager
# Start the job-manager
# Make sure whether is running or not.
start_job_manager
