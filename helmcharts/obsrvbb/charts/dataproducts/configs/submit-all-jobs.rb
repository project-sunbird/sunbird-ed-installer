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
@submit_jobs_command = "source /data/analytics/venv/bin/activate && dataproducts submit_druid_jobs --report_list_jobs_url #{@report_list_jobs_url} --auth_token #{@submit_jobs_auth_token}"

def log(message)
    @log.write("#{Time.now.to_s}: #{message}\n")
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
    file = File.read("{{ .Values.analytics_home }}/scripts/model-config.json")
    file = file.gsub("$(date --date yesterday '+%Y-%m-%d')", `date --date yesterday '+%Y-%m-%d'`.strip)
    file = file.gsub("$(date '+%Y-%m-%d')", `date "+%Y-%m-%d"`.strip)
    config_hash = JSON.parse(file)
    log("Config file loaded")
    jobs.each do |job|
        if job == "monitor-job-summ"
            # log("python")
            # system('/bin/bash -l -c "'+ @submit_jobs_command +'"')
            submit_job(job, config_hash[job])
        elsif report_jobs[job].nil?
            submit_job(job, config_hash[job])
        else
            submit_job(report_jobs[job], config_hash[job])   
        end

        log("Submitted #{jobs.count} jobs for processing")
    end    
end

def submit_job(job, config)
    job_config =  {model: job, config: config}.to_json
    log("message: #{job_config}")
    @kafka.deliver_message(job_config, topic: @topic)
    log("Submitted #{job} for processing")
end




submit_all_jobs
