# For local development
terraform {
  source = "../../modules//upload-files/"
}

dependency "storage" {
    config_path = "../storage"
    mock_outputs = {
      gcp_public_container_name = "dummy-container-public"
    }
}

dependency "service-account" {
  config_path = "../service-account"
  mock_outputs = {
    service_account_email = "dummy-service-account-email"
    service_account_key_local_path = "dummy-service-account-key"
  }
}

inputs = {
  storage_container_public              = dependency.storage.outputs.gcp_public_container_name
  storage_account_name                  = dependency.service-account.outputs.service_account_key_email
  storage_account_primary_access_key    = dependency.service-account.outputs.service_account_key_local_path
}