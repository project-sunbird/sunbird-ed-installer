variable "storage_account_name" {
    type        = string
    description = "Storage account name."
}

variable "storage_container_public" {
    type        = string
    description = "Public storage container name with blob access."
}

variable "terms_and_conditions_container" {
    type        = string
    description = "The container name dedicated for terms and conditions."
    default     = "termsandconditions"
  
}

variable "public_state_container" {
    type        = string
    description = "The container name dedicated for public state."
    default     = "public"
}

variable "sourcing_state_container" {
    type        = string
    description = "The container name dedicated for sourcing state."
    default     = "sourcing"
}

variable "storage_account_primary_access_key" {
    type        = string
    description = "Storage account primary access key."
}

variable "sunbird_public_artifacts_account" {
    type        = string
    description = "The public account name where storage artifacts are published for this release."
    default     = "downloadableartifacts"
}

variable "sunbird_public_artifacts_account_sas_url" {
    type        = string
    description = "The readonly sas token url for the sunbird public account."
    default     = "https://downloadableartifacts.blob.core.windows.net/?sv=2022-11-02&ss=bf&srt=co&sp=rlitfx&se=2026-08-30T20:37:29Z&st=2024-07-10T12:37:29Z&spr=https&sig=hcXksbrbR%2BJgCB0EKxiwHCSsQ6r2eSlyOVnqnjxFOH0%3D"
}

variable "sunbird_public_artifacts_container" {
    type        = string
    description = "The container name dedicated for this release which holds the storage artifatcs."
    default     = "release700"
}

variable "sunbird_terms_and_conditions_container" {
    type        = string
    description = "terms_and_conditions storage container name."
    default = "termsandcondtions"
  
}

variable "sunbird_public_state_container" {
    type        = string
    description = "public_state storage container name."
    default = "public"
}

variable "sunbird_sourcing_state_container" {
    type        = string
    description = "sourcing_state storage container name."
    default = "sourcing"
}
