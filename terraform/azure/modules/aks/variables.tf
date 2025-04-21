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

variable "big_nodepool_name" {
  type        = string
  description = "Big node pool name."
  default     = "bigpool"
}

variable "big_node_count" {
  type        = number
  description = "Big node pool node count."
  default     = 3
}

variable "big_node_size" {
  type        = string
  description = "Big node pool node size."
  default     = "Standard_B16as_v2"
}
variable "resource_group_name" {
  type        = string
  description = "Resource group name to create the AKS cluster."
}

variable "network_plugin" {
  type        = string
  description = "AKS cluster network plugin."
  default     = "kubenet"
}

variable "vnet_subnet_id" {
  type        = string
  description = "AKS cluster subnet id."
}

# variable "small_nodepool_name" {
#   type        = string
#   description = "Small nodepool name."
#   default     = "smallpool"
# }

# variable "small_node_count" {
#   type        = number
#   description = "Small nodepool node count."
#   default     = 1
# }

# variable "small_node_size" {
#   type        = string
#   description = "Small nodepool node size."
#   default     = "Standard_B8as_v2"
# }

variable "service_cidr" {
  type        = string
  description = "Kubernets service CIDR range."
  default     = "10.100.0.0/16"
}

variable "dns_service_ip" {
  type        = string
  description = "Kubernets service CIDR range."
  default     = "10.100.10.100"
}

variable "max_small_nodepool_nodes" {
  type        = number
  description = "Maximum number of node count in auto scaling."
  default     = 1
}

variable "end_date_relative" {
  type        = string
  description = "Service principal expiry. Default value set to 3 years."
  default     = "26280h"
}

variable "private_ingressgateway_ip" {
    type        = string
    description = "Nginx private ingress ip."
    default = "10.0.0.10"
}


variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
}