#!/usr/bin/env bash
#
set -x

home=`echo $HOME`
jobJarPath="{{ include "common.tplvalues.render" ( dict "value" .Values.content.snapshotJarPath "context" $ ) }}/{{ .Values.content.snapshotJarName }}"
jobConfPath="{{ include "common.tplvalues.render" ( dict "value" .Values.jobConfig.esContentIndexerPath "context" $ ) }}"
today=$(date "+%Y-%m-%d")
libs_path="{{ .Values.content.snapshotPath }}/jars/etl-jobs-1.0"

echo "STARTED EXECUTING CONTENT CACHE INDEXER..."

nohup {{ .Values.sparkHome }}/bin/spark-submit \
--conf spark.jars.ivy=/tmp/.ivy \
--conf spark.driver.extraJavaOptions="-Dconfig.file=${jobConfPath}" \
--class org.sunbird.analytics.jobs.ESRedisIndexer \
--jars $(echo ${libs_path}/lib/*.jar | tr ' ' ',') \
${jobJarPath} >> "{{ .Values.content.snapshotPath }}/logs/$today-task-execution.log" 2>&1
