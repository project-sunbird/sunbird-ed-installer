data "google_project" "current" {
  project_id = var.project
}

resource "random_id" "bucket_id" {
  byte_length = 5
}

locals {
  unique_uuid = random_id.bucket_id.hex

  common_tags = {
    environment    = var.environment
    BuildingBlock  = var.building_block
    unique_uuid    = local.unique_uuid
  }

  environment_name = "${var.building_block}-${var.environment}"
}

resource "google_storage_bucket" "storage_container_public" {
  project       = var.project
  name          = "${local.environment_name}-public-${local.unique_uuid}"
  location      = var.region
  force_destroy = true

  versioning {
    enabled = true
  }

  uniform_bucket_level_access = false
  public_access_prevention = "unspecified"

  cors {
    origin          = ["https://${var.domain}"]
    method          = ["GET", "POST", "PUT", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket_iam_member" "full_access_public" {
  bucket = google_storage_bucket.storage_container_public.name
  role   = "roles/storage.admin"
  member = "allUsers"
}

resource "google_storage_bucket" "storage_container_private" {
  project       = var.project
  name          = "${local.environment_name}-private-${local.unique_uuid}"
  location      = var.region
  force_destroy = true

  versioning {
    enabled = true
  }

  uniform_bucket_level_access = true
}

resource "google_storage_bucket" "dial_state_container_public" {
  name          = "${local.environment_name}-dial-${local.unique_uuid}"
  project       = var.project
  location      = var.region
  force_destroy = true

  versioning {
    enabled = true
  }

  uniform_bucket_level_access = false

  cors {
    origin          = ["https://${var.domain}"]
    method          = ["GET", "POST", "PUT", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket_iam_member" "full_access_dial" {
  bucket = google_storage_bucket.dial_state_container_public.name
  role   = "roles/storage.admin"
  member = "allUsers"
}