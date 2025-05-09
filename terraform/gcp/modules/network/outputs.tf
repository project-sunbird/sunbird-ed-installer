output "network" {
  description = "A reference (self_link) to the VPC network"
  value       = google_compute_network.vpc.self_link
}

# ---------------------------------------------------------------------------------------------------------------------
# Public Subnetwork Outputs
# ---------------------------------------------------------------------------------------------------------------------

output "public_subnetwork" {
  description = "A reference (self_link) to the public subnetwork"
  value       = google_compute_subnetwork.vpc_subnetwork_public.self_link
}

output "public_subnetwork_name" {
  description = "Name of the public subnetwork"
  value       = google_compute_subnetwork.vpc_subnetwork_public.name
}

output "public_subnetwork_cidr_block" {
  value = google_compute_subnetwork.vpc_subnetwork_public.ip_cidr_range
}

output "public_subnetwork_gateway" {
  value = google_compute_subnetwork.vpc_subnetwork_public.gateway_address
}

output "public_subnetwork_secondary_cidr_block" {
  value = google_compute_subnetwork.vpc_subnetwork_public.secondary_ip_range[0].ip_cidr_range
}

output "public_subnetwork_secondary_range_name" {
  value = google_compute_subnetwork.vpc_subnetwork_public.secondary_ip_range[0].range_name
}

output "public_services_secondary_cidr_block" {
  value = google_compute_subnetwork.vpc_subnetwork_public.secondary_ip_range[1].ip_cidr_range
}

output "public_services_secondary_range_name" {
  value = google_compute_subnetwork.vpc_subnetwork_public.secondary_ip_range[1].range_name
}