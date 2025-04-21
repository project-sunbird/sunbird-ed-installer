variable "environment" {
    type        = string
    description = "environment name. All resources will be prefixed with this value."
}

variable "building_block" {
    type        = string
    description = "Building block name. All resources will be prefixed with this value."
}

variable "location" {
    type        = string
    description = "Azure location to create the resources."
    default     = "Central India"
}

variable "additional_tags" {
    type        = map(string)
    description = "Additional tags for the resources. These tags will be applied to all the resources."
    default     = {}
}

variable "azure_storage_tier" {
    type        = string
    description = "Azure storage tier - Standard / Premium."
    default     = "Standard"
}

variable "azure_storage_replication" {
    type        = string
    description = "Azure storage replication - LRS / ZRS / GRS etc."
    default     = "LRS"
}

variable "resource_group_name" {
  type        = string
  description = "Resource group name to create the AKS cluster."
}

variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
}

