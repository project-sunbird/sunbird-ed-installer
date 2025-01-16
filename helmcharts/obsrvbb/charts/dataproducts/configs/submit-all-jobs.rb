$LOAD_PATH << '/.gem/ruby/2.6.0/gems'
ENV['GEM_HOME'] = '/.gem/ruby/2.6.0'
ENV['GEM_PATH'] = '/.gem/ruby/2.6.0'
require "ruby-kafka"
require 'json'
@log = File.open("{{ .Values.analytics_home }}/logs/logfile.log", 'a')
@kafka = Kafka.new(["{{ .Values.global.kafka.host }}:{{ .Values.global.kafka.port }}"])
@topic = "{{ .Values.analytics_job_queue_topic }}"
@report_list_jobs_url = "https://{{ .Values.global.domain }}/api/data/v1/"
@submit_jobs_auth_token = "{{ .Values.global.sunbird_admin_api_token }}"
@submit_jobs_command = "source /data/analytics/venv/bin/activate && python3 /data/analytics/scripts/druid-report-submitter.py --report_list_jobs_url #{@report_list_jobs_url} --auth_token #{@submit_jobs_auth_token}"

print "Submit jobs command: #{@submit_jobs_command}"
def log(message)
  @log.write("#{Time.now}: #{message}\\n")
end

def submit_all_jobs

  report_jobs = {
            "assessment-dashboard-metrics" => "org.sunbird.analytics.job.report.AssessmentMetricsJobV2",
            "course-dashboard-metrics" => "org.sunbird.analytics.job.report.CourseMetricsJobV2",
            "course-enrollment-report" => "org.sunbird.analytics.job.report.CourseEnrollmentJob",
            "course-consumption-report" => "org.sunbird.analytics.job.report.CourseConsumptionJob",
            "etb-metrics" => "org.sunbird.analytics.job.report.ETBMetricsJob",
            "admin-geo-reports" => "org.sunbird.analytics.job.report.StateAdminGeoReportJob",
            "admin-user-reports" => "org.sunbird.analytics.job.report.StateAdminReportJob"
        }
  jobs = ["wfs", "content-rating-updater", "monitor-job-summ"]
  log("Starting to submit #{jobs.count} jobs for processing")

  file = File.read("/data/analytics/scripts/model-config.json")
  log("Original config file loaded")

  file = file.gsub("$(date --date yesterday '+%Y-%m-%d')", `date --date yesterday '+%Y-%m-%d'`.strip)
  file = file.gsub("$(date '+%Y-%m-%d')", `date '+%Y-%m-%d'`.strip)
  log("Dates replaced in config file")

  config_hash = JSON.parse(file)
  log("Parsed config file into JSON")

  jobs.each do |job|
    log("Processing job: #{job}")
    if job == "monitor-job-summ"
      log("Running submit_jobs_command for #{job}")
      system('/bin/bash -l -c "' + @submit_jobs_command + '"')
      submit_job(job, config_hash[job])
    elsif report_jobs[job].nil?
      log("Job not found in report_jobs: #{job}")
      submit_job(job, config_hash[job])
    else
      log("Job found in report_jobs: #{job}")
      submit_job(report_jobs[job], config_hash[job])
    end
  end

  log("Submitted #{jobs.count} jobs for processing")
end

def submit_job(job, config)
  job_config = { model: job, config: config }.to_json
  log("Job config for #{job}: #{job_config}")

  @kafka.deliver_message(job_config, topic: @topic)
  log("Submitted #{job} for processing")
end

log("Starting job submission script")
submit_all_jobs
log("Completed job submission script")
