locals {
  # This section will be enabled after final code is pushed and tagged
  # source_base_url = "github.com/<org>/modules.git//app"
  global_vars  = yamldecode(file(find_in_parent_folders("global-values.yaml")))
  environment  = local.global_vars.global.environment
  building_block = local.global_vars.global.building_block
  subscription_id = local.global_vars.global.subscription_id
  location = local.global_vars.global.cloud_storage_region
}

# For local development
terraform {
  source = "../../modules//storage/"
}

dependency "network" {
    config_path = "../network"
    mock_outputs = {
      resource_group_name = "dummy-rg"
    }
}

inputs = {
  environment                 = local.environment
  building_block      = local.building_block
  resource_group_name = dependency.network.outputs.resource_group_name
  subscription_id             = local.subscription_id
  location            = local.location
}