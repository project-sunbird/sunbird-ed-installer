output "service_account_key_local_path" {
  value       = local_file.service_account.filename
  description = "The local file path of the downloaded service account key file."
}

output "service_account_key_email" {
  value       = jsondecode(local_file.service_account.content).client_email
  description = "The email address extracted from the service account key file."
  sensitive = true
}

output "service_account_private_key" {
  value       = replace(jsondecode(base64decode(google_service_account_key.service_account.private_key)).private_key, "\n", "\\n")
  description = "The private key of the service account in a single line."
  sensitive   = true
}