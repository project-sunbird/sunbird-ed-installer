variable "storage_account_name" {
    type        = string
    description = "Storage account name."
}

variable "storage_container_public" {
    type        = string
    description = "Public storage container name with blob access."
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

