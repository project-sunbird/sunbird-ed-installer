#!/usr/bin/env python3
    
import json
import os
import subprocess
import time
from kafka import KafkaConsumer
from datetime import datetime
import logging


os.environ['SPARK_HOME'] = '/data/analytics/spark-3.1.3-bin-hadoop2.7'
os.environ['MODELS_HOME'] = '/data/analytics/models-2.0'
os.environ['KAFKA_HOME'] = '/opt/bitnami/kafka_2.12-2.8.0'
os.environ['KAFKA_TOPIC'] = '{}.druid.report.job_queue'.format(os.getenv('ENV', 'dev'))
os.environ['KAFKA_BOOTSTRAP_SERVERS'] = 'kafka:9092'
os.environ['DP_LOGS'] = '/data/analytics/logs/data-products'

print('Starting Druid report processor...')
print('environment variables', os.environ)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.getenv('DP_LOGS', ''), 'druid_processor.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)



KAFKA_TOPIC = os.getenv('KAFKA_TOPIC')
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS')
SPARK_HOME = os.getenv('SPARK_HOME')
MODELS_HOME = os.getenv('MODELS_HOME')
KAFKA_HOME = os.getenv('KAFKA_HOME')


def get_kafka_consumer():
    """Initialize and return Kafka consumer"""
    return KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_deserializer=lambda x: json.loads(x.decode('utf-8')),
        auto_offset_reset='earliest',
        enable_auto_commit=False,
        consumer_timeout_ms=30000,  # 30 seconds timeout
        group_id=os.getenv('KAFKA_CONSUMER_GROUP', 'druid-report-processor-group')
    )

def submit_spark_job(config_json):
    """Submit Spark job and wait for completion"""
    cmd = [
        f"{SPARK_HOME}/bin/spark-submit",
        "--master", "local[*]",
        "--class", "org.ekstep.analytics.job.JobExecutor",
        "--jars", f"/data/analytics/models-2.0/lib/*,/data/analytics/models-2.0/analytics-framework-2.0.jar,/data/analytics/models-2.0/scruid_2.12-2.5.0.jar,/data/analytics/models-2.0/batch-models-2.0.jar",
        f"/data/analytics/models-2.0/batch-models-2.0.jar",
        "--model", "druid_reports",
        "--config", json.dumps(config_json)
    ]
    
    logger.info(f"Submitting Spark job with config: {config_json}")
    
    try:
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        stdout, stderr = process.communicate()
        
        if process.returncode == 0:
            logger.info("Spark job completed successfully")
        else:
            logger.error(f"Spark job failed with return code {process.returncode}")
            logger.error(f"stderr: {stderr}")
            
        return process.returncode == 0
    except Exception as e:
        logger.error(f"Error submitting Spark job: {str(e)}")
        return False

def process_events():
    """Main function to process Kafka events"""
    consumer = get_kafka_consumer()
    logger.info("Started consuming from Kafka topic")
    
    try:
        message_processed = False
        for message in consumer:
            message_processed = True
            logger.info(f"Received message: {message.value}")
            event = message.value
            
            # Log the model type for debugging
            model_type = event.get('model')
            logger.info(f"Event model type: {model_type}")
            
            # Check if the event is for druid_reports
            if model_type == 'druid_reports':
                logger.info("Received druid_reports event")
                
                # Extract config from event and submit the Spark job
                config = event.get('config')
                if config:
                    success = submit_spark_job(config)
                    
                    if success:
                        consumer.commit()  # Commit offset only if job succeeds
                        logger.info("Successfully processed event and committed offset")
                    else:
                        logger.error("Failed to process event, will retry on next run")
                        break
                else:
                    logger.error("Event missing config field")
                    consumer.commit()  # Commit invalid events to avoid getting stuck
            else:
                logger.info(f"Skipping event with model type: {model_type}")
                consumer.commit()  # Commit offset for non-matching events

        if not message_processed:
            logger.info("No messages available to process. Exiting.")
    except Exception as e:
        logger.error(f"Error processing events: {str(e)}")
        logger.exception("Full traceback:")
    finally:
        consumer.close()

if __name__ == "__main__":
    logger.info("Starting Druid Processor Service")
    process_events()