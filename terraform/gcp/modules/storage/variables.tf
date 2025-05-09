variable "project" {
  description = "The project ID where the bucket needs to be created"
  type        = string
}

variable "building_block" {
  type        = string
  description = "Building block name. All resources will be prefixed with this value."
}

variable "environment" {
    type        = string
    description = "environment name. All resources will be prefixed with this value."
}

variable "env" {
  type        = string
  description = "Environment name. All resources will be prefixed with this value."
}

variable "region" {
  description = "The region for cloud storage bucket"
  type        = string
}

variable "domain" {
  description = "Domain name for the storage account."
  type        = string
}