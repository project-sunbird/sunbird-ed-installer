locals {
  # This section will be enabled after final code is pushed and tagged
  # source_base_url = "github.com/<org>/modules.git//app"
  global_vars  = yamldecode(file(find_in_parent_folders("global-values.yaml")))
  environment  = local.global_vars.global.environment
  building_block = local.global_vars.global.building_block
  region = local.global_vars.global.cloud_storage_region
  project= local.global_vars.global.cloud_storage_project
  env = local.global_vars.global.env
  domain = local.global_vars.global.domain
}

# For local development
terraform {
  source = "../../modules//storage/"
}

inputs = {
  environment         = local.environment
  building_block      = local.building_block
  region              = local.region
  project             = local.project
  env                 = local.env
  domain              = local.domain
}