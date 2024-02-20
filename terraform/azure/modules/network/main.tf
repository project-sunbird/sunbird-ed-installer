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
}

resource "azurerm_resource_group" "rg" {
  name     = "${local.environment_name}"
  location = var.location
  tags = merge(
      local.common_tags,
      var.additional_tags
      )
}

resource "azurerm_subnet" "aks_subnet" {
  name                 = "${local.environment_name}-aks"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = var.aks_subnet_cidr
  service_endpoints    = var.aks_subnet_service_endpoints
}

resource "azurerm_virtual_network" "vnet" {
  name                = "${local.environment_name}"
  location            = var.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = var.vnet_cidr
  tags = merge(
      local.common_tags,
      var.additional_tags
      )
}