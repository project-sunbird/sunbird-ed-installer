# ---------------------------------------------------------------------------------------------------------------------
# REQUIRED PARAMETERS
# These variables are expected to be passed in by the operator
# ---------------------------------------------------------------------------------------------------------------------
variable "environment" {
    type        = string
    description = "environment name. All resources will be prefixed with this value."
}

variable "building_block" {
    type        = string
    description = "Building block name. All resources will be prefixed with this value."
}
variable "project" {
  description = "The project ID for the network"
  type        = string
}

variable "region" {
  description = "The region for subnetworks in the network"
  type        = string
}
# ---------------------------------------------------------------------------------------------------------------------
# OPTIONAL PARAMETERS
# Generally, these values won't need to be changed.
# ---------------------------------------------------------------------------------------------------------------------
variable "zone" {
  description = "The zone for the cluster. If the cluster is regional, this should be one of the zones in the region. Otherwise, this should be the same zone as the region."
  type        = string
  default     = ""
}

## VPC

variable "create_network" {
  description = "Create a new VPC network."
  type        = bool
  default     = true
}

variable "network" {
  description = "The VPC network to use. If create_network is true, this will be the name of the new network."
  type        = string
  default     = ""
}

variable "subnetwork" {
  description = "The subnetwork to use. If create_network is true, this will be the name of the new subnetwork."
  type        = string
  default     = ""
}

variable "services_secondary_range_name" {
  description = "The name associated with the services subnetwork secondary range, used when adding an alias IP range to a VM instance. The name must be 1-63 characters long, and comply with RFC1035. The name must be unique within the subnetwork."
  type        = string
  default     = ""
}

variable "vpc_cidr_block" {
  type        = string
  description = "VPC CIDR range"
  default     = "10.0.0.0/16"
}

variable "vpc_secondary_cidr_block" {
  description = "The IP address range of the VPC's secondary address range in CIDR notation. A prefix of /16 is recommended. Do not use a prefix higher than /27."
  type        = string
  default     = "10.1.0.0/16"
}

variable "auto_assign_public_ip" {
  type        = bool
  description = "Auto assign public ip's to instances in this subnet"
  default     = true
}

variable "public_subnetwork_secondary_range_name" {
  description = "The name associated with the pod subnetwork secondary range, used when adding an alias IP range to a VM instance. The name must be 1-63 characters long, and comply with RFC1035. The name must be unique within the subnetwork."
  type        = string
  default     = "public-cluster"
}

variable "public_services_secondary_range_name" {
  description = "The name associated with the services subnetwork secondary range, used when adding an alias IP range to a VM instance. The name must be 1-63 characters long, and comply with RFC1035. The name must be unique within the subnetwork."
  type        = string
  default     = "public-services"
}

variable "public_services_secondary_cidr_block" {
  description = "The IP address range of the VPC's public services secondary address range in CIDR notation. A prefix of /16 is recommended. Do not use a prefix higher than /27. Note: this variable is optional and is used primarily for backwards compatibility, if not specified a range will be calculated using var.secondary_cidr_block, var.secondary_cidr_subnetwork_width_delta and var.secondary_cidr_subnetwork_spacing."
  type        = string
  default     = null
}

variable "private_services_secondary_cidr_block" {
  description = "The IP address range of the VPC's private services secondary address range in CIDR notation. A prefix of /16 is recommended. Do not use a prefix higher than /27. Note: this variable is optional and is used primarily for backwards compatibility, if not specified a range will be calculated using var.secondary_cidr_block, var.secondary_cidr_subnetwork_width_delta and var.secondary_cidr_subnetwork_spacing."
  type        = string
  default     = null
}

variable "secondary_cidr_subnetwork_width_delta" {
  description = "The difference between your network and subnetwork's secondary range netmask; an /16 network and a /20 subnetwork would be 4."
  type        = number
  default     = 4
}

variable "secondary_cidr_subnetwork_spacing" {
  description = "How many subnetwork-mask sized spaces to leave between each subnetwork type's secondary ranges."
  type        = number
  default     = 0
}

variable "igw_cidr" {
  type        = list(string)
  description = "Internet gateway CIDR range."
  default     = ["0.0.0.0/0"]
}


variable "log_config" {
  description = "The logging options for the subnetwork flow logs. Setting this value to `null` will disable them. See https://www.terraform.io/docs/providers/google/r/compute_subnetwork.html for more information and examples."
  type = object({
    aggregation_interval = string
    flow_sampling        = number
    metadata             = string
  })

  default = {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

variable "cidr_subnetwork_spacing" {
  description = "How many subnetwork-mask sized spaces to leave between each subnetwork type."
  type        = number
  default     = 0
}