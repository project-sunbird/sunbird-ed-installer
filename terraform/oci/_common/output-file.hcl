locals {
  # This section will be enabled after final code is pushed and tagged
  # source_base_url = "github.com/<org>/modules.git//app"
  global_vars  = yamldecode(file(find_in_parent_folders("global-values.yaml")))
  env = local.global_vars.global.env
  environment  = local.global_vars.global.environment
  building_block = local.global_vars.global.building_block
  region = local.global_vars.global.cloud_storage_region
  project = local.global_vars.global.cloud_storage_project
  cloud_storage_provider = local.global_vars.global.cloud_storage_provider
}

# For local development
terraform {
  source = "../../modules//output-file/"
}

dependency "storage" {
    config_path = "../storage"
    mock_outputs = {
      gcp_public_container_name = "dummy"
      gcp_private_container_name = "dummy"
    }
}

dependency "gke" {
    config_path = "../gke"
    mock_outputs = {
      storage_class = "dummy"
    }
}

dependency "keys" {
    config_path = "../keys"
    mock_outputs = {
      random_string = "dummy-string"
    }
}
 
 dependency "service-account" {
   config_path = "../service-account"
   mock_outputs = {
     service_account_key_local_path = "service_account_key_local_path" 
     service_account_email         = "dummy-service_account_email"
  }
}

inputs = {
  env                                = local.env
  environment                        = local.environment
  building_block                     = local.building_block
  storage_container_public           = dependency.storage.outputs.gcp_public_container_name
  storage_container_private          = dependency.storage.outputs.gcp_private_container_name
  private_ingressgateway_ip          = dependency.gke.outputs.private_ingressgateway_ip
  encryption_string                  = dependency.keys.outputs.encryption_string
  random_string                      = dependency.keys.outputs.random_string
  cloud_storage_region               = local.region
  dial_state_container_public        = dependency.storage.outputs.gcp_dial_state_container_public
  gcp_project_id                     = local.project
  gcp_storage_bucket_key             = dependency.service-account.outputs.service_account_private_key
  gcp_storage_account_mail           = dependency.service-account.outputs.service_account_key_email
  storage_class                      = dependency.gke.outputs.storage_class
  cloud_storage_provider             = local.cloud_storage_provider
  cloud_storage_region               = local.region
}