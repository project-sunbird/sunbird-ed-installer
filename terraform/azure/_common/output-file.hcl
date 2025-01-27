locals {
  # This section will be enabled after final code is pushed and tagged
  # source_base_url = "github.com/<org>/modules.git//app"
  environment_vars = read_terragrunt_config(find_in_parent_folders("environment.hcl"))
  env = local.environment_vars.locals.env
  environment = local.environment_vars.locals.environment
  building_block = local.environment_vars.locals.building_block
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
      azurerm_flink_state_container_private = "dummy-container-flink"
      azurerm_dial_state_container_public = "dummy-container-dail"
      azurerm_telemetry_container_public  = "dummy-container-telemetry"
      azurerm_reports_container_private = "dummy-container-report"
      azurerm_backups_container_private ="dummy-container-backups"
      azurerm_storage_account_key = "dummy-key"
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
  env                                = local.environment_vars.locals.env
  environment                        = local.environment
  building_block                     = local.building_block
  private_ingressgateway_ip          = dependency.aks.outputs.private_ingressgateway_ip
  storage_account_name               = dependency.storage.outputs.azurerm_storage_account_name
  storage_container_public           = dependency.storage.outputs.azurerm_storage_container_public
  storage_container_private          = dependency.storage.outputs.azurerm_storage_container_private
  reports_container_private          = dependency.storage.outputs.azurerm_reports_container_private
  backups_container_private          = dependency.storage.outputs.azurerm_backups_container_private
  flink_container_private            = dependency.storage.outputs.azurerm_flink_state_container_private
  dial_state_container_public        = dependency.storage.outputs.azurerm_dial_state_container_public
  telemetry_container_private        = dependency.storage.outputs.azurerm_telemetry_container_private
  storage_account_primary_access_key = dependency.storage.outputs.azurerm_storage_account_key
  encryption_string                  = dependency.keys.outputs.encryption_string
  random_string                      = dependency.keys.outputs.random_string
}