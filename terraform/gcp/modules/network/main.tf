# ---------------------------------------------------------------------------------------------------------------------
# Create the Network & corresponding Router to attach other resources to
# Networks that preserve the default route are automatically enabled for Private Google Access to GCP services
# provided subnetworks each opt-in; in general, Private Google Access should be the default.
# ---------------------------------------------------------------------------------------------------------------------

locals {
    common_tags = {
      environment = "${var.environment}"
      BuildingBlock = "${var.building_block}"
    }
    environment_name = "${var.building_block}-${var.environment}"
}
resource "google_compute_network" "vpc" {
  name    = "${local.environment_name}-network"
  project = var.project

  # Always define custom subnetworks- one subnetwork per region isn't useful for an opinionated setup
  auto_create_subnetworks = false

  # A global routing mode can have an unexpected impact on load balancers; always use a regional mode
  routing_mode = "REGIONAL"

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_compute_router" "vpc_router" {
  name = "${local.environment_name}-router"

  project = var.project
  region  = var.region
  network = google_compute_network.vpc.self_link
}

# ---------------------------------------------------------------------------------------------------------------------
# Public Subnetwork Config
# Public internet access for instances with addresses is automatically configured by the default gateway for 0.0.0.0/0
# External access is configured with Cloud NAT, which subsumes egress traffic for instances without external addresses
# ---------------------------------------------------------------------------------------------------------------------

resource "google_compute_subnetwork" "vpc_subnetwork_public" {
  name = "${local.environment_name}-subnetwork-public"

  project = var.project
  region  = var.region
  network = google_compute_network.vpc.self_link

  private_ip_google_access = true
  ip_cidr_range            = cidrsubnet(var.vpc_cidr_block, var.secondary_cidr_subnetwork_width_delta, 0)

  secondary_ip_range {
    range_name = var.public_subnetwork_secondary_range_name
    ip_cidr_range = cidrsubnet(
      var.vpc_secondary_cidr_block,
      var.secondary_cidr_subnetwork_width_delta,
      0
    )
  }

  secondary_ip_range {
    range_name = var.public_services_secondary_range_name
    ip_cidr_range = var.public_services_secondary_cidr_block != null ? var.public_services_secondary_cidr_block : cidrsubnet(
      var.vpc_secondary_cidr_block,
      var.secondary_cidr_subnetwork_width_delta,
      1 * (2 + var.secondary_cidr_subnetwork_spacing)
    )
  }

  dynamic "log_config" {
    for_each = var.log_config == null ? [] : tolist([var.log_config])

    content {
      aggregation_interval = var.log_config.aggregation_interval
      flow_sampling        = var.log_config.flow_sampling
      metadata             = var.log_config.metadata
    }
  }
}

# ---------------------------------------------------------------------------------------------------------------------
# Attach Firewall Rules to allow inbound traffic to tagged instances
# ---------------------------------------------------------------------------------------------------------------------

resource "google_compute_firewall" "allow_http_https" {
  name    = "${local.environment_name}-allow-http-https"
  network = google_compute_network.vpc.name
    project = var.project  # Add this line to specify the projec

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  source_ranges = ["0.0.0.0/0"]
  direction     = "INGRESS"
  target_tags   = ["http-server", "https-server"]

  depends_on = [google_compute_network.vpc]
}