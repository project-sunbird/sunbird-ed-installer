locals {
  # This section will be enabled after final code is pushed and tagged
  # source_base_url = "github.com/<org>/modules.git//app"
  global_vars  = yamldecode(file(find_in_parent_folders("global-values.yaml")))
  environment  = local.global_vars.global.environment
  building_block = local.global_vars.global.building_block
}

# For local development
terraform {
  source = "../../modules//keys/"
}

dependency "storage" {
    config_path = "../storage"
    mock_outputs = {
      gcp_private_container_name = "dummy-container-private"   
      storage_container_public = "dummy-container-public"                      
    }
}

inputs = {
  environment                          = local.environment
  storage_container_private            = dependency.storage.outputs.gcp_private_container_name
  building_block                       = local.building_block
  storage_container_public            = dependency.storage.outputs.gcp_public_container_name
  }