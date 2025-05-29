locals {
  # Load YAML file instead of environment.hcl
  global_vars  = yamldecode(file(find_in_parent_folders("global-values.yaml")))
  environment  = local.global_vars.global.environment
  building_block = local.global_vars.global.building_block
  project = local.global_vars.global.cloud_storage_project
  region = local.global_vars.global.cloud_storage_region
  
}

# For local development
terraform {
  source = "../../modules//network/"
}

inputs = {
  environment         = local.environment
  building_block      = local.building_block
  project             = local.project
  region              = local.region
}