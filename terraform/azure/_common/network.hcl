locals {
  # Load YAML file instead of environment.hcl
  global_vars  = yamldecode(file(find_in_parent_folders("global-values.yaml")))
  environment  = local.global_vars.global.environment
  building_block = local.global_vars.global.building_block
  subscription_id = local.global_vars.global.subscription_id
  location = local.global_vars.global.cloud_storage_region
}

# For local development
terraform {
  source = "../../modules//network/"
}

inputs = {
  environment    = local.environment
  building_block = local.building_block
  subscription_id = local.subscription_id
  location        = local.location
}
