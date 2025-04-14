locals {
  # This section will be enabled after final code is pushed and tagged
  # source_base_url = "github.com/<org>/modules.git//app"
  global_vars  = yamldecode(file(find_in_parent_folders("global-values.yaml")))
  environment  = local.global_vars.global.environment
  building_block = local.global_vars.global.building_block
  # random_string  = local.environment_vars.locals.random_string 
}

# For local development
terraform {
  source = "../../modules//keys/"
}

dependency "storage" {
    config_path = "../storage"
    mock_outputs = {
      azurerm_storage_account_name = "dummy-account"
      azurerm_storage_container_public = "dummy-container-public"
      azurerm_storage_container_private = "dummy-container-private"
      azurerm_storage_account_key = "dummy-key"
    }
}

inputs = {
  environment                                = local.environment
  building_block                     = local.building_block
  storage_account_name               = dependency.storage.outputs.azurerm_storage_account_name
  storage_container_public           = dependency.storage.outputs.azurerm_storage_container_public
  storage_container_private          = dependency.storage.outputs.azurerm_storage_container_private
  storage_account_primary_access_key = dependency.storage.outputs.azurerm_storage_account_key
  # random_string                      = local.random_string 
}