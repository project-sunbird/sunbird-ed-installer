#!/usr/bin/env bash
DATA_DIR=/data/analytics/logs/data-products
[[ -d $DATA_DIR ]] || mkdir -p $DATA_DIR
export SPARK_HOME={{ .Values.global.spark_home }}
export MODELS_HOME={{ .Values.analytics_home }}/models-2.0
export DP_LOGS=$DATA_DIR
## Job to run daily
cd /data/analytics/scripts
source model-config.sh
today=$(date "+%Y-%m-%d")

libs_path="{{ .Values.analytics_home }}/models-2.0/data-products-1.0"

get_report_job_model_name(){
	case "$1" in
		"course-enrollment-report") echo 'org.sunbird.analytics.job.report.CourseEnrollmentJob'
		;;
		"course-consumption-report") echo 'org.sunbird.analytics.job.report.CourseConsumptionJob'
		;;
		"funnel-report") echo 'org.sunbird.analytics.sourcing.FunnelReport'
		;;
		"sourcing-metrics") echo 'org.sunbird.analytics.sourcing.SourcingMetrics'
		;;
		"admin-geo-reports") echo 'org.sunbird.analytics.job.report.StateAdminGeoReportJob'
		;;
		"etb-metrics") echo 'org.sunbird.analytics.job.report.ETBMetricsJob'
		;;
		"admin-user-reports") echo 'org.sunbird.analytics.job.report.StateAdminReportJob'
		;;
		"userinfo-exhaust") echo 'org.sunbird.analytics.exhaust.collection.UserInfoExhaustJob'
		;;
		"response-exhaust") echo 'org.sunbird.analytics.exhaust.collection.ResponseExhaustJob'
		;;
    "response-exhaust-v2") echo 'org.sunbird.analytics.exhaust.collection.ResponseExhaustJobV2'
		;;
		"progress-exhaust") echo 'org.sunbird.analytics.exhaust.collection.ProgressExhaustJob'
		;;
		"progress-exhaust-v2") echo 'org.sunbird.analytics.exhaust.collection.ProgressExhaustJobV2'
		;;
		"cassandra-migration") echo 'org.sunbird.analytics.updater.CassandraMigratorJob'
    ;;
		"collection-summary-report") echo 'org.sunbird.analytics.job.report.CollectionSummaryJob'
		;;
		"program-collection-summary-report") echo 'org.sunbird.analytics.job.report.CollectionSummaryJob'
		;;
		"collection-summary-report-v2") echo 'org.sunbird.analytics.job.report.CollectionSummaryJobV2'
		;;
		"assessment-score-metric-correction") echo 'org.sunbird.analytics.audit.AssessmentScoreCorrectionJob'
		;;
		"course-batch-status-updater") echo 'org.sunbird.analytics.audit.CourseBatchStatusUpdaterJob'
		;;
		"collection-reconciliation-job") echo 'org.sunbird.analytics.audit.CollectionReconciliationJob'
		;;
		"assessment-correction") echo 'org.sunbird.analytics.job.report.AssessmentCorrectionJob'
	  ;;
	  "score-metric-migration-job") echo 'org.sunbird.analytics.audit.ScoreMetricMigrationJob'
	  ;;
    "assessment-archival") echo 'org.sunbird.analytics.job.report.AssessmentArchivalJob'
    ;;
    "assessment-archived-removal") echo 'org.sunbird.analytics.job.report.AssessmentArchivalJob'
		;;
    "uci-private-exhaust") echo 'org.sunbird.analytics.exhaust.uci.UCIPrivateExhaustJob'
    ;;
    "uci-response-exhaust") echo 'org.sunbird.analytics.exhaust.uci.UCIResponseExhaustJob'
    ;;
		*) echo $1
		;;
	esac
}

if [ ! -z "$1" ]; then job_id=$(get_report_job_model_name $1); fi

if [ ! -z "$1" ]; then job_config=$(config $1 $2); else job_config="$2"; fi
echo "Job config: $job_config" >> "$DP_LOGS/$today-config.log"

if [ ! -z "$2" ]; then batchIds=";$2"; else batchIds=""; fi



echo "Starting the job - $1" >> "$DP_LOGS/$today-job-execution.log"

echo "Job modelName - $job_id" >> "$DP_LOGS/$today-job-execution.log"

if [[ "{{ .Values.global.sunbird_cloud_storage_provider }}" == "gcloud" ]]; then
  nohup $SPARK_HOME/bin/spark-submit \
    --conf spark.jars.ivy=/tmp/.ivy \
    --conf spark.driver.extraJavaOptions='-Dconfig.file=/data/analytics/scripts/common.conf' \
    --conf spark.hadoop.fs.gs.impl=com.google.cloud.hadoop.fs.gcs.GoogleHadoopFileSystem \
    --conf spark.hadoop.fs.AbstractFileSystem.gs.impl=com.google.cloud.hadoop.fs.gcs.GoogleHadoopFS \
	--conf spark.hadoop.google.cloud.auth.service.account.enable=true \
    --master 'local[*]' \
    --jars $(echo ${libs_path}/lib/*.jar | tr ' ' ','),$MODELS_HOME/analytics-framework-2.0.jar,$MODELS_HOME/scruid_2.12-2.5.0.jar,$MODELS_HOME/batch-models-2.0.jar,/data/analytics/models-2.0/data-products-1.0/lib/google-cloud-storage-2.0.1.jar,/data/analytics/models-2.0/data-products-1.0/lib/gcs-connector-hadoop2-2.0.1-shaded.jar \
    --class org.ekstep.analytics.job.JobExecutor \
    $MODELS_HOME/batch-models-2.0.jar --model "$job_id" --config "$job_config$batchIds" \
    >> "$DP_LOGS/$today-job-execution.log" 2>&1
else
  nohup $SPARK_HOME/bin/spark-submit \
    --conf spark.jars.ivy=/tmp/.ivy \
    --conf spark.driver.extraJavaOptions='-Dconfig.file=/data/analytics/scripts/common.conf' \
    --master 'local[*]' \
    --jars $(echo ${libs_path}/lib/*.jar | tr ' ' ','),$MODELS_HOME/analytics-framework-2.0.jar,$MODELS_HOME/scruid_2.12-2.5.0.jar,$MODELS_HOME/batch-models-2.0.jar \
    --class org.ekstep.analytics.job.JobExecutor \
    $MODELS_HOME/batch-models-2.0.jar --model "$job_id" --config "$job_config$batchIds" \
    >> "$DP_LOGS/$today-job-execution.log" 2>&1
fi

# Log completion
if [[ $? -eq 0 ]]; then
  echo "Job execution completed successfully - $1" >> "$DP_LOGS/$today-job-execution.log"
else
  echo "Job execution failed - $1" >> "$DP_LOGS/$today-job-execution.log"
fi
