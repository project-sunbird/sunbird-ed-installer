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
    default     = "https://downloadableartifacts.blob.core.windows.net/?se=2030-12-31T23%3A59%3A00Z&sp=rxlft&spr=https&sv=2022-11-02&ss=fb&srt=sco&sig=9IDJq3H94oluxYUwB2M1SxwjdvpVvYzKMgAJHomrjuY%3D"
}
variable "sunbird_public_artifacts_container" {
    type        = string
    description = "The container name dedicated for this release which holds the storage artifatcs."
    default     = "release700"
}

