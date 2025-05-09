variable "env" {
    type        = string
    description = "Env name. All resources will be prefixed with this value in helm charts."
}

variable "environment" {
    type        = string
    description = "Envrionment name. All resources will be prefixed with this value in terraform."
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

 variable "random_string" {
    type        = string
    description = "This string will be used to encrypt / mask various values. Use a strong random string in order to secure the applications. The string should be between 12 and 24 characters in length. If you forget the string, the application will stop working and the string cannot be retrieved."
    validation {
      condition     = length(var.random_string) >= 12 || length(var.random_string) <= 24
      error_message = "The string must have a length ranging from 12 to 24 characters."
  }
}

variable "private_ingressgateway_ip" {
    type        = string
    description = "Private LB IP."
}

variable "encryption_string" {
  type        = string
  description = "This string will be used to encrypt / mask various values. Use a strong random string in order to secure the applications. The string should be exactly 32 characters in length. If you forget the string, the application will stop working and the string cannot be retrieved."

  validation {
    condition     = length(var.encryption_string) == 32
    error_message = "The string must have a length of exactly 32 characters."
  }
}

variable "dial_state_container_public" {
    type        = string
    description = "Public storage container name with blob access."
}

variable "gcp_storage_bucket_key" {
  description = "The key for accessing the Google Cloud Storage bucket"
  type        = string
  default     = ""
}

variable "gcp_storage_account_mail" {
  description = "The name of the GCP storage account"
  type        = string
  default     = ""
}

variable "gcp_project_id" {
  description = "The GCP project ID"
  type        = string
  default     = ""
}

variable "storage_class" {
  description = "The storage class for the GKE cluster."
  type        = string
  default     = ""  
}

variable "cloud_storage_provider" {
  description = "The cloud storage provider to use."
  type        = string
  default     = ""
}

variable "cloud_storage_region" {
  description = "The region for the cloud storage provider."
  type        = string
  default     = ""
}