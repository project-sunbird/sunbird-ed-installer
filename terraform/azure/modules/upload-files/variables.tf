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
    default     = "https://downloadableartifacts.blob.core.windows.net/?sv=2022-11-02&ss=b&srt=co&sp=rlitf&se=2024-06-30T09:36:39Z&st=2024-02-01T19:36:39Z&spr=https&sig=uLO4%2BSOEYt05kMSRy3M%2BxWUpU832U5TFo4eU0LkcTsQ%3D"
}

variable "sunbird_public_artifacts_container" {
    type        = string
    description = "The container name dedicated for this release which holds the storage artifatcs."
    default     = "release600"
}