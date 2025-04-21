locals {
  # This section will be enabled after final code is pushed and tagged
  # source_base_url = "github.com/<org>/modules.git//app"
  global_vars  = yamldecode(file(find_in_parent_folders("global-values.yaml")))
  env = local.global_vars.global.env
  environment  = local.global_vars.global.environment
  building_block = local.global_vars.global.building_block
  subscription_id = local.global_vars.global.subscription_id
  # random_string  = local.environment_vars.locals.random_string
}

# For local development
terraform {
  source = "../../modules//output-file/"
}

dependency "storage" {
    config_path = "../storage"
    mock_outputs = {
      azurerm_storage_account_name = "dummy-account"
      azurerm_storage_container_public = "dummy-container-public"
      azurerm_storage_container_private = "dummy-container-private"
      azurerm_storage_account_key = "dummy-key"
      azurerm_dial_state_container_public = "dummy-container-dail"
    }
}

dependency "aks" {
    config_path = "../aks"
}

dependency "keys" {
    config_path = "../keys"
    mock_outputs = {
      random_string = "dummy-string"
    }
}

inputs = {
  env                                = local.env
  environment                        = local.environment
  building_block                     = local.building_block
  subscription_id                    = local.subscription_id
  private_ingressgateway_ip          = dependency.aks.outputs.private_ingressgateway_ip
  storage_account_name               = dependency.storage.outputs.azurerm_storage_account_name
  storage_container_public           = dependency.storage.outputs.azurerm_storage_container_public
  storage_container_private          = dependency.storage.outputs.azurerm_storage_container_private
  storage_account_primary_access_key = dependency.storage.outputs.azurerm_storage_account_key
  encryption_string                  = dependency.keys.outputs.encryption_string
  random_string                      = dependency.keys.outputs.random_string
  dial_state_container_public        = dependency.storage.outputs.azurerm_dial_state_container_public

}