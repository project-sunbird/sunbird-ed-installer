#!/usr/bin/env bash

home=`echo $HOME`
jobJarPath="{{ include "common.tplvalues.render" ( dict "value" .Values.content.snapshotJarPath "context" $ ) }}/{{ .Values.content.snapshotJarName }}"
jobConfPath="{{ include "common.tplvalues.render" ( dict "value" .Values.jobConfig.deviceProfilePath "context" $ ) }}"
today=$(date "+%Y-%m-%d")

nohup {{ .Values.sparkHome }}/bin/spark-submit \
--conf spark.driver.extraJavaOptions="-Dconfig.file=${jobConfPath}" \
--class org.sunbird.analytics.jobs.DeviceProfileUpdateCassandra \
${jobJarPath} >> "{{ .Values.content.snapshotPath }}/logs/$today-task-execution.log" 2>&1