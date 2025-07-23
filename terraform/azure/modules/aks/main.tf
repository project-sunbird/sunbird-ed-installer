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
  skip_provider_registration = true  # Optional
  }
  locals {
      common_tags = {
        environment = "${var.environment}"
        BuildingBlock = "${var.building_block}"
      }
      environment_name = "${var.building_block}-${var.environment}"
  }

  resource "azuread_application" "aks_app" {
    display_name    = local.environment_name
  }

  resource "azuread_service_principal" "aks_sp" {
    client_id = azuread_application.aks_app.client_id
  }

  resource "azuread_service_principal_password" "aks_sp_password" {
  service_principal_id = azuread_service_principal.aks_sp.id
  end_date             = timeadd(timestamp(), var.end_date_relative)
}

resource "azurerm_role_assignment" "aks_sp_assignment" {
  principal_id         = split("/", azuread_service_principal.aks_sp.id)[2]
  scope                = var.vnet_subnet_id
  role_definition_name = "Network Contributor"
}

  resource "azurerm_kubernetes_cluster" "aks" {
    name                = "${local.environment_name}"
    location            = var.location
    resource_group_name = var.resource_group_name
    dns_prefix          = "${local.environment_name}"
    #Uncomment the below line to create a private cluster
    # private_cluster_enabled = true
    default_node_pool {
      name           = var.big_nodepool_name
      node_count     = var.big_node_count
      vm_size        = var.big_node_size
      vnet_subnet_id = var.vnet_subnet_id
      max_pods       = 250
    }

    network_profile {
      network_plugin = var.network_plugin
      service_cidr   = var.service_cidr
      dns_service_ip = var.dns_service_ip
    }

    service_principal {
      client_id     = azuread_application.aks_app.client_id
      client_secret = azuread_service_principal_password.aks_sp_password.value
    }

    tags = merge(
        local.common_tags,
        var.additional_tags
        )
    depends_on = [ azurerm_role_assignment.aks_sp_assignment ]
  }

  # resource "azurerm_kubernetes_cluster_node_pool" "small_nodepool" {
  #   name                  = var.small_nodepool_name
  #   kubernetes_cluster_id = azurerm_kubernetes_cluster.aks.id
  #   vm_size               = var.small_node_size
  #   node_count            = var.small_node_count
  #   vnet_subnet_id        = var.vnet_subnet_id
  #   mode                  = "System"
  #   enable_auto_scaling   = true
  #   min_count             = 1
  #   max_count             = var.max_small_nodepool_nodes
  #   tags = merge(
  #       local.common_tags,
  #       var.additional_tags
  #       )
  #   depends_on = [ azurerm_kubernetes_cluster.aks ]
  # }
  resource "local_file" "kubeconfig" {
    content      = azurerm_kubernetes_cluster.aks.kube_config_raw
    filename     = pathexpand("~/.kube/config")
    depends_on = [ azurerm_kubernetes_cluster.aks ]
  }

  # Pre-create private LB in future if ever there is an instance of private ip
  # taken by node or some other service.
  # Better option is to use lookup in charts where private ingress ip is required.

  # resource "azurerm_lb" "private_lb" {
  #   name                = "private-ilb"
  #   resource_group_name = var.resource_group_name
  #   location            = var.location
  #   sku                 = "Standard"
  #   frontend_ip_configuration {
  #     name                          = "ilb-frontend-ip"
  #     subnet_id                     = var.vnet_subnet_id
  #     private_ip_address_allocation = "static"
  #     private_ip_address            = var.private_ingressgateway_ip
  #   }
  # }