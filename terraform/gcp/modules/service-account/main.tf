
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

# REMOVED: Project-wide storage.admin role is overly permissive
# Storage access should be granted at the bucket level in the storage module
# using google_storage_bucket_iam_member with specific buckets and minimal roles
# such as roles/storage.objectAdmin for specific buckets only

# Assign Workload Identity User role to service account (optional)
resource "google_service_account_iam_member" "workload_identity_role" {
  for_each = {
    for k, v in var.service_account_bindings : k => v
    if v == true
  }

  service_account_id = google_service_account.service_account.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "serviceAccount:${var.project}.svc.id.goog[${each.key}]"
}


# SECURITY WARNING: Service account keys are disabled for security reasons
# Service account keys should NOT be created and stored as files
# Instead, use Workload Identity to allow Kubernetes pods to authenticate
# If keys are absolutely required, use a secrets management solution like:
# - Google Secret Manager
# - HashiCorp Vault
# - Sealed Secrets
#
# Uncomment the blocks below ONLY if you have a secure key management solution
# and understand the security implications

# resource "google_service_account_key" "service_account" {
#   service_account_id = google_service_account.service_account.name
#   public_key_type    = "TYPE_X509_PEM_FILE"
# }

# resource "local_file" "service_account" {
#   content  = base64decode(google_service_account_key.service_account.private_key)
#   filename = "${path.module}/sa-keys/${local.environment_name}.json"
# }

# resource "google_storage_bucket_object" "gke_service_account" {
#   name   = "service-accounts/${local.environment_name}.json"
#   source = local_file.service_account.filename
#   bucket = var.sa_key_store_bucket
#   lifecycle {
#     ignore_changes = [crc32c, md5hash, generation]
#   }
# }

