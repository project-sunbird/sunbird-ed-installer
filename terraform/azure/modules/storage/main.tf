 terraform {
  required_providers {
    azurerm = {
      version = "~> 4.0.1"  # Define the version constraint for the AzureRM provider
      source  = "hashicorp/azurerm"
    }
  }
}
provider "azurerm" {
  subscription_id ="${var.subscription_id}"
  features {}  # Always include the features block for Azure provider
  resource_provider_registrations = "none"  # Optional
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
  https_traffic_only_enabled = false
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

resource "azurerm_storage_container" "dial_state_container_public" {
  name                  = "dial"
  storage_account_name  = azurerm_storage_account.storage_account.name
  container_access_type = "blob"
}
