
# Service account creation
locals {
  create_sa_binding         = (var.cluster_service_account_name == "" || var.sa_namespace == "") ? false : true
  all_service_account_roles = var.service_account_roles
  common_tags = {
        environment = "${var.environment}"
        BuildingBlock = "${var.building_block}"
      }
      environment_name = "${var.building_block}-${var.environment}"
}

resource "google_service_account" "service_account" {
  project      = var.project
  account_id   = local.environment_name
  display_name = var.cluster_service_account_description
}

# Assign roles to the service account
resource "google_project_iam_member" "service_account-roles" {
  for_each = toset(local.all_service_account_roles)

  project = var.project
  role    = each.value
  member  = "serviceAccount:${google_service_account.service_account.email}"
}

resource "google_project_iam_member" "storage_admin_role" {
  project = var.project
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.service_account.email}"
}

# Assign Workload Identity User role to service account (optional)
resource "google_service_account_iam_member" "workload_identity-role" {
  count = local.create_sa_binding == true ? 1 : 0

  service_account_id = google_service_account.service_account.name
  role    = "roles/iam.workloadIdentityUser"
  member  = "serviceAccount:${var.project}.svc.id.goog[${var.sa_namespace}/${var.cluster_service_account_name}]"
}

# Create a service account key
# Generate a service account key
resource "google_service_account_key" "service_account" {
  service_account_id = google_service_account.service_account.name
  public_key_type    = "TYPE_X509_PEM_FILE"
}

# Save key to local file
resource "local_file" "service_account" {
  content  = base64decode(google_service_account_key.service_account.private_key)
  filename = "${path.module}/sa-keys/${local.environment_name}.json"
}

# Upload the key to GCS
# Upload the key to GCS
resource "google_storage_bucket_object" "gke_service_account" {
  name   = "service-accounts/${local.environment_name}.json"
  source = local_file.service_account.filename
  bucket = var.sa_key_store_bucket

  lifecycle {
    ignore_changes = [
      crc32c,
      md5hash,
      generation
    ]
  }
}

