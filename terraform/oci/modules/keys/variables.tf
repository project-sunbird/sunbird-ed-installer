variable "environment" {
    type        = string
    description = "environment name. All resources will be prefixed with this value."
}

variable "building_block" {
    type        = string
    description = "Building block name. All resources will be prefixed with this value."
}

variable "storage_container_public" {
    type        = string
    description = "Public storage container name with blob access."
}

variable "storage_container_private" {
    type        = string
    description = "Private storage container name."
}


variable "base_location" {
    type        = string
    description = "Location of terrafrom execution folder."
}

variable "rsa_keys_count" {
    type        = number
    description = "Number of rsa keys to generate"
    default     = 2
}