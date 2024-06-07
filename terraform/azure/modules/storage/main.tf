provider "azurerm" {
  features {}
  skip_provider_registration = true
}

data "azurerm_subscription" "current" {}

locals {
    common_tags = {
      environment = "${var.environment}"
      BuildingBlock = "${var.building_block}"
    }
    subid = split("-", "${data.azurerm_subscription.current.subscription_id}")
    environment_name = "${var.building_block}-${var.environment}"
    uid = local.subid[0]
    environment_name_without_dashes = replace(local.environment_name, "-", "")
    storage_account_name = "${local.environment_name_without_dashes}${local.uid}"
}

resource "azurerm_storage_account" "storage_account" {
  name                     = "${local.storage_account_name}"
  resource_group_name      = var.resource_group_name
  location                 = var.location
  account_tier             = var.azure_storage_tier
  account_replication_type = var.azure_storage_replication
  enable_https_traffic_only = false
  blob_properties {
    cors_rule {
      max_age_in_seconds = 200
      allowed_origins    = ["*"]
      allowed_methods    = ["GET", "HEAD", "OPTIONS", "PUT"]
      exposed_headers    = ["Access-Control-Allow-Origin", "Access-Control-Allow-Methods"]
      allowed_headers    = ["Access-Control-Allow-Origin", "Access-Control-Allow-Method", "Origin", "x-ms-meta-qq", "x-ms-blob-type", "x-ms-blob-content-type", "Content-Type"]
    }
  }
  tags = merge(
      local.common_tags,
      var.additional_tags
      )
}

resource "azurerm_storage_container" "storage_container_private" {
  name                  = "${local.environment_name}-private"
  storage_account_name  = azurerm_storage_account.storage_account.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "storage_container_public" {
  name                  = "${local.environment_name}-public"
  storage_account_name  = azurerm_storage_account.storage_account.name
  container_access_type = "blob"
}

resource "azurerm_storage_container" "reports_container_private" {
  name                  = "reports"
  storage_account_name  = azurerm_storage_account.storage_account.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "telemetry_container_private" {
  name                  = "telemetry-data-store"
  storage_account_name  = azurerm_storage_account.storage_account.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "backups_container_private" {
  name                  = "backups"
  storage_account_name  = azurerm_storage_account.storage_account.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "flink_state_container_private" {
  name                  = "flink-state-backend"
  storage_account_name  = azurerm_storage_account.storage_account.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "dial_state_container_public" {
  name                  = "dial"
  storage_account_name  = azurerm_storage_account.storage_account.name
  container_access_type = "blob"
}