#!/usr/bin/env bash

home=`echo $HOME`
jobJarPath="{{ include "common.tplvalues.render" ( dict "value" .Values.content.snapshotJarPath "context" $ ) }}/{{ .Values.content.snapshotJarName }}"
jobConfPath="{{ include "common.tplvalues.render" ( dict "value" .Values.jobConfig.esDialCodeIndexerPath "context" $ ) }}"
today=$(date "+%Y-%m-%d")
libs_path="{{ .Values.content.snapshotPath }}/jars/etl-jobs-1.0"
export SPARK_HOME={{ .Values.sparkHome }}

echo "STARTED EXECUTING DIALCODE CACHE INDEXER..."

#nohup "{{ .Values.sparkHome }}"/bin/spark-submit \
#--conf spark.driver.extraJavaOptions="-Dconfig.file=${jobConfPath}" \
#--class org.ekstep.analytics.jobs.CSVToRedisIndexer \
#${jobJarPath} >> "{{ .Values.content.snapshotPath }}/logs/$today-task-execution.log" 2>&1

nohup $SPARK_HOME/bin/spark-submit --conf spark.jars.ivy=/tmp/.ivy  --conf spark.driver.extraJavaOptions="-Dconfig.file=${jobConfPath}"  --jars $(echo ${libs_path}/lib/*.jar | tr ' ' ',')  --class org.sunbird.analytics.jobs.CSVToRedisIndexer ${jobJarPath} >> "{{ .Values.content.snapshotPath }}/logs/$today-task-execution.log" 2>&1
