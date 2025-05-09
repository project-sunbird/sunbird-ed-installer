output "gcp_public_container_name" {
  value = google_storage_bucket.storage_container_public.name
}

output "gcp_private_container_name" {
  value = google_storage_bucket.storage_container_private.name
}
output "gcp_dial_state_container_public" {
  value = google_storage_bucket.dial_state_container_public.name
}