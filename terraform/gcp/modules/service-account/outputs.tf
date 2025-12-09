# SECURITY: Service account key outputs are disabled for security
# If you uncommented the key creation resources in main.tf, uncomment these outputs
# However, consider using Workload Identity instead

# output "service_account_key_local_path" {
#   value       = local_file.service_account.filename
#   description = "The local file path of the downloaded service account key file."
# }

# output "service_account_key_email" {
#   value       = jsondecode(local_file.service_account.content).client_email
#   description = "The email address extracted from the service account key file."
#   sensitive   = true
# }

# output "service_account_private_key" {
#   value       = replace(jsondecode(base64decode(google_service_account_key.service_account.private_key)).private_key, "\n", "\\n")
#   description = "The private key of the service account in a single line."
#   sensitive   = true
# }

# output "cloud_storage_private_key_id" {
#   value       = jsondecode(base64decode(google_service_account_key.service_account.private_key)).private_key_id
#   description = "The private key ID of the service account used for cloud storage."
#   sensitive   = true
# }

output "service_account_email" {
  value       = google_service_account.service_account.email
  description = "The email address of the service account (safe to expose, not sensitive)."
}

output "service_account_id" {
  value       = google_service_account.service_account.id
  description = "The fully-qualified ID of the service account."
}