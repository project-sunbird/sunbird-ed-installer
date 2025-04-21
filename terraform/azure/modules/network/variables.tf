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

variable "vnet_cidr" {
    type        = list(string)
    description = "Azure vnet CIDR range."
    default     = ["10.0.0.0/16"]
}

variable "aks_subnet_cidr" {
  type        = list(string)
  description = "Azure AKS subnet CIDR range."
  default     = ["10.0.0.0/20"]
}

variable "aks_subnet_service_endpoints" {
  type        = list(string)
  description = "Azure AKS subnet service endpoints."
  default     = ["Microsoft.Sql", "Microsoft.Storage"]
}
variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
}