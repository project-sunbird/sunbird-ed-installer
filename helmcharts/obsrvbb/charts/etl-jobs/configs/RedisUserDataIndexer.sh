#!/usr/bin/env bash

#$1 identifier: userid- Especially for UserCache indexer script to cache specific user id details
#$2 date: YYYY-MM-DD- Especially for UserCache indexer script to cache all the user data from this specific updated date.
#$3 populate_anonymous_user: true/false - Especially for UserCacheIndexer to read anonymous user's data
#$4 refresh_user_data: true/false - Especially for UserCacheIndexer to refresh user's data of redis

home=`echo $HOME`
jobJarPath="{{ include "common.tplvalues.render" ( dict "value" .Values.content.snapshotJarPath "context" $ ) }}/{{ .Values.content.snapshotJarName }}"
jobConfPath="{{ include "common.tplvalues.render" ( dict "value" .Values.jobConfig.cassandraRedisPath "context" $ ) }}"
today=$(date "+%Y-%m-%d")
libs_path="{{ .Values.content.snapshotPath }}/jars/etl-jobs-1.0"

echo "STARTED EXECUTING USER CACHE INDEXER... $1 $2 $3 $4"

nohup {{ .Values.sparkHome }}/bin/spark-submit \
--conf spark.jars.ivy=/tmp/.ivy \
--conf spark.driver.extraJavaOptions="-Dconfig.file=${jobConfPath}" \
--jars $(echo ${libs_path}/lib/*.jar | tr ' ' ',') \
--class org.sunbird.analytics.jobs.UserCacheIndexer \
${jobJarPath} $1 $2 $3 $4 >> "{{ .Values.content.snapshotPath }}/logs/$today-task-execution.log" 2>&1