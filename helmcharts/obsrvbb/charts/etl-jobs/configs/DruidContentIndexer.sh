#!/usr/bin/env bash
set -e
# Configurations
druidCoordinatorIP="{{ .Values.global.druid.coordinatorhost }}"
dataSourceName="{{ .Values.dataSource }}"
today=`date +%Y-%m-%d`
interval="2019-01-01_$today"
now=`date +%Y-%m-%d-%s`
home=`echo $HOME`
ingestionSpecFilePath="{{ include "common.tplvalues.render" ( dict "value" .Values.ingestionSpecPath "context" $ ) }}"
jobJarPath="{{ include "common.tplvalues.render" ( dict "value" .Values.content.snapshotJarPath "context" $ ) }}/{{ .Values.content.snapshotJarName }}"
jobConfPath="{{ include "common.tplvalues.render" ( dict "value" .Values.jobConfig.esCloudUploaderPath "context" $ ) }}"
libs_path="{{ .Values.content.snapshotPath }}/jars/etl-jobs-1.0"
# export SPARK_HOME= {{ .Values.sparkHome }}

# get list of segments from content model snapshot datasource
bkpIFS="$IFS"
segmentIds=$(curl -X 'GET' -H 'Content-Type:application/json' http://${druidCoordinatorIP}:8081/druid/coordinator/v1/metadata/datasources/${dataSourceName}/segments)
IFS=',]['
read -r -a array <<< ${segmentIds}
IFS="$bkpIFS"

echo "STARTED EXECUTING USER DRUID CONTENT INDEXER..."

# start the spark script to fetch Elasticsearch data and write it to a file and upload to cloud
#nohup {{ .Values.sparkHome }}/bin/spark-submit \
#--conf spark.driver.extraJavaOptions="-Dconfig.file=${jobConfPath}" \
#--class org.ekstep.analytics.jobs.ESCloudUploader \
#${jobJarPath} >> "{{ .Values.content.snapshotPath }}/logs/$today-task-execution.log" 2>&1

nohup {{ .Values.sparkHome }}/bin/spark-submit --conf spark.jars.ivy=/tmp/.ivy --conf spark.driver.extraJavaOptions="-Dconfig.file=${jobConfPath}"  --jars $(echo ${libs_path}/lib/*.jar | tr ' ' ',')  --class org.sunbird.analytics.jobs.ESCloudUploader ${jobJarPath} >> "{{ .Values.content.snapshotPath }}/logs/$today-task-execution.log" 2>&1

printf "\n>>> submit ingestion task to Druid!\n"

# submit task to start batch ingestion
curl -X 'POST' -H 'Content-Type:application/json' -d @${ingestionSpecFilePath} http://${druidCoordinatorIP}:8081/druid/indexer/v1/task


for index in "${!array[@]}"
do
    val=( $(eval echo ${array[index]}) )
    printf "\n>>> Disabling segment id: $val \n"
    # disable older segments
    curl -X 'DELETE' -H 'Content-Type:application/json' http://${druidCoordinatorIP}:8081/druid/coordinator/v1/datasources/${dataSourceName}/segments/$val
done

printf "\n>>> Deleting segments from interval $interval \n"

# delete older segments
curl -X 'DELETE' -H 'Content-Type:application/json' http://${druidCoordinatorIP}:8081/druid/coordinator/v1/datasources/${dataSourceName}/intervals/${interval}

printf "\n>>> success!\n"


