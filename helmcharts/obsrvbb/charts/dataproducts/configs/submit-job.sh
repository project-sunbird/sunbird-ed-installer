#!/usr/bin/env bash

export SPARK_HOME={{ .Values.global.spark_home }}
export MODELS_HOME={{ .Values.analytics.home }}/models-{{ .Values.model_version }}
export DP_LOGS={{ .Values.analytics.home }}/logs/data-products
export KAFKA_HOME=/opt/bitnami/kafka_2.12-2.8.0

## job broker-list and kafka-topic
job_brokerList={{ .Values.global.kafka.host }}:{{ .Values.global.kafka.port }}
job_topic= {{ .Values.analytics_job_queue_topic }}

## Job to run daily
cd {{ .Values.analytics.home }}/scripts
source model-config.sh
today=$(date "+%Y-%m-%d")

if [ -z "$job_config" ]; then job_config=$(config $1); fi

echo "Submitted $1 with config $job_config" >> "$DP_LOGS/$today-job-execution.log"
echo '{ "model" :' \"$1\" ',' ' "config": ' "$job_config" '}' >> "$DP_LOGS/$today-job-execution-debug.log"
echo '{ "model" :' \"$1\" ',' ' "config": ' "$job_config" '}' > /tmp/job-request.json
cat /tmp/job-request.json | $KAFKA_HOME/bin/kafka-console-producer.sh --broker-list $job_brokerList --topic $job_topic >> "$DP_LOGS/$today-job-execution.log" 2>&1
