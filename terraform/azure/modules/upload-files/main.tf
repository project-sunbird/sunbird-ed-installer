resource "local_sensitive_file" "rclone_config" {
content  = templatefile("${path.module}/config.tfpl", {
    storage_account_name = var.storage_account_name,
    storage_account_key = var.storage_account_primary_access_key
    sunbird_public_artifacts_account = var.sunbird_public_artifacts_account
    sunbird_public_artifacts_account_sas_url = var.sunbird_public_artifacts_account_sas_url
  })
  filename = pathexpand("~/.config/rclone/rclone.conf")
}

resource "null_resource" "copy_from_sunbird_container" {
  triggers = {
    command = "${timestamp()}"
  }
  provisioner "local-exec" {
      command = "rclone copy sunbird:${var.sunbird_public_artifacts_container} ownaccount:${var.storage_container_public} --transfers 600 --checkers 600 --exclude .terragrunt-source-manifest"
  }
  depends_on = [local_sensitive_file.rclone_config]
}

locals {
  template_files = fileset("${path.module}/sunbird-rc/schemas", "*.json")
}

resource "local_file" "output_files" {
  for_each = toset(local.template_files)
  content  = templatefile("${path.module}/sunbird-rc/schemas/${each.value}", {
     cloud_storage_schema_url = "https://${var.storage_account_name}/${var.storage_container_public}"
  })
  filename = "${path.module}/sunbird-rc/schemas/${each.value}"
}

resource "null_resource" "upload_rc_schemas_to_public_blob" {
  triggers = {
    command = "${timestamp()}"
  }
  provisioner "local-exec" {
      command = "rclone copy ${path.module}/sunbird-rc/schemas ownaccount:${var.storage_container_public}/schemas --transfers 25 --checkers 25 --exclude .terragrunt-source-manifest"
  }
  depends_on = [local_sensitive_file.rclone_config]
}