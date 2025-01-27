#!/usr/bin/env python3

"""
Script to submit druid report jobs.
"""

import os
import sys
import json
import requests
import argparse
from datetime import date
from kafka import KafkaProducer
from kafka.errors import KafkaError

# Common config functions
def init_config():
    """Initialize common configuration"""
    return {
        "kafka_metrics_topic": "telemetry.metrics",
        "kafka_job_queue": "{}.druid.report.job_queue"
    }

# Kafka utility functions
def get_producer(broker_host):
    """Get Kafka producer instance"""
    return KafkaProducer(bootstrap_servers=[broker_host])

def send(broker_host, topic, msg):
    """Send message to Kafka topic"""
    producer = get_producer(broker_host)
    result = producer.send(topic, msg.encode('utf-8'))
    try:
        record_metadata = result.get(timeout=10)
    except KafkaError:
        print('Error sending message to Kafka')
    pass

def push_metrics(broker_host, topic, metric):
    """Push metrics to Kafka"""
    jd = json.dumps(metric)
    send(broker_host, topic, jd)
    pass

def get_config():
    """Initialize configuration"""
    env = os.getenv("ENV", "dev")
    config = init_config()
    kafka_broker = os.getenv("KAFKA_BROKER_HOST", "localhost:9092")
    kafka_topic = config["kafka_job_queue"].format(env)
    return env, kafka_broker, kafka_topic

def get_active_jobs(report_search_base_url, auth_token):
    """Fetch active jobs from the API"""
    url = "{}report/jobs".format(report_search_base_url)
    payload = """{"request": {"filters": {"status": ["ACTIVE"]}}}"""
    headers = {
        'content-type': "application/json; charset=utf-8",
        'cache-control': "no-cache",
        'Authorization': "Bearer " + auth_token
    }
    response = requests.request("POST", url, data=payload, headers=headers)
    print('Active report configurations fetched from the API')
    return response.json()['result']['reports']

def deactivate_job(report_search_base_url, auth_token, report_id):
    """Deactivate a specific job"""
    url = ("{}report/jobs/deactivate/"+report_id).format(report_search_base_url)
    headers = {
        'cache-control': "no-cache",
        'Authorization': "Bearer " + auth_token
    }
    response = requests.request("POST", url, headers=headers)
    return response

def interpolate_config(report_config, replace_list):
    """Interpolate configuration with replacement values"""
    report_config_str = json.dumps(report_config)
    for item in replace_list:
        report_config_str = report_config_str.replace(item["key"], item["value"])
    print('String interpolation for the report config completed')
    return report_config_str

def check_schedule(report_schedule, report_id, interval_slider, deactivate_func):
    """Check if the report should be scheduled based on its configuration"""
    if report_schedule == 'DAILY':
        return True
    elif report_schedule == 'WEEKLY':
        interval_slider = int(interval_slider) if interval_slider is not None else 0
        if interval_slider < 7 and interval_slider >= 0 and date.today().weekday() == interval_slider:
            return True
    elif report_schedule == 'MONTHLY':
        interval_slider = int(interval_slider) + 1 if interval_slider is not None else 1
        if interval_slider < 21 and interval_slider > 0 and date.today().day == interval_slider:
            return True
    elif report_schedule == 'ONCE':
        deactivate_func(report_id)
        return True
    else:
        return False

def submit_job(report_config, kafka_broker, kafka_topic):
    """Submit job to Kafka"""
    report_config = json.loads(report_config)
    report_id = report_config['reportConfig']['id']
    submit_config = json.loads("""{"model":"druid_reports", "config":{"search":{"type":"none"},"model":"org.ekstep.analytics.model.DruidQueryProcessingModel","output":[{"to":"console","params":{"printEvent":false}}],"parallelization":8,"appName":"Druid Query Processor","deviceMapping":false}}""")
    submit_config['config']['modelParams'] = report_config
    submit_config['config']['modelParams']['modelName'] = report_id + "_job"
    send(kafka_broker, kafka_topic, json.dumps(submit_config))
    print('Job submitted to the job manager with config - ', submit_config)
    return

def process_druid_reports(report_search_base_url, auth_token, replace_list="""[{"key":"__store__","value":"azure"},{"key":"__container__","value":"reports"}]"""):
    """Main function to process and submit druid reports"""
    print('Starting the job submitter...')
    
    # Get configuration
    env, kafka_broker, kafka_topic = get_config()
    replace_list = json.loads(replace_list)
    
    # Get active jobs
    reports = get_active_jobs(report_search_base_url, auth_token)
    
    # Process each report
    for report in reports:
        try:
            deactivate_func = lambda report_id: deactivate_job(report_search_base_url, auth_token, report_id)
            if check_schedule(
                report['reportSchedule'].upper(),
                report['reportId'],
                report['config']['reportConfig']['dateRange'].get('intervalSlider'),
                deactivate_func
            ):
                report_config = interpolate_config(report['config'], replace_list)
                submit_job(report_config, kafka_broker, kafka_topic)
        except Exception as e:
            print('ERROR::While submitting druid report', report['reportId'])
    
    print('Job submission completed...')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Submit Druid report jobs')
    parser.add_argument('--report_list_jobs_url', required=True, help='Base URL for report jobs API')
    parser.add_argument('--auth_token', required=True, help='Authentication token')
    parser.add_argument('--replace_list', default="""[{"key":"__store__","value":"azure"},{"key":"__container__","value":"reports"}]""",
                        help='JSON string for replacement configurations')
    
    args = parser.parse_args()
    process_druid_reports(args.report_list_jobs_url, args.auth_token, args.replace_list)

"""
Example usage:

1. Direct Python call:
python druid_report_submitter.py --report_list_jobs_url "https://<domain>/api/data/v1/" --auth_token "<token>"

2. Using bash command (existing usage):
source /data/analytics/venv/bin/activate && python druid_report_submitter.py --report_list_jobs_url "https://<domain>/api/data/v1/" --auth_token "<token>"

"""