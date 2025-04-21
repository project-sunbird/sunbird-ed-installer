locals {
  global_values_cloud_file = "${var.base_location}/../global-cloud-values.yaml"
}

resource "local_sensitive_file" "global_cloud_values_yaml" {
content  = templatefile("${path.module}/global-cloud-values.yaml.tfpl", {
    env = var.env,
    environment = var.environment,
    building_block = var.building_block,
    azure_storage_account_name = var.storage_account_name,
    azure_storage_account_key = var.storage_account_primary_access_key,
    azure_public_container_name = var.storage_container_public,
    azure_private_container_name = var.storage_container_private,
    azure_dial_state_container_name = var.dial_state_container_public,
    private_ingressgateway_ip = var.private_ingressgateway_ip,
    encryption_string = var.encryption_string,
    random_string = var.random_string
  })
  filename = local.global_values_cloud_file
}

resource "null_resource" "upload_global_cloud_values_yaml" {
  triggers = {
    command = "${timestamp()}"
  }
  provisioner "local-exec" {
      command = "az storage blob upload --account-name ${var.storage_account_name} --account-key ${var.storage_account_primary_access_key} --container-name ${var.storage_container_private} --file ${local.global_values_cloud_file} --name ${var.environment}-global-cloud-values.yaml --overwrite"
  }
  depends_on = [ local_sensitive_file.global_cloud_values_yaml ]
}

# Sample code to enable encryption of global values files
# Encrypted files cannot be passed to helm

# resource "null_resource" "terrahelp_encryption" {
#   triggers = {
#     command = "${timestamp()}"
#   }
#   provisioner "local-exec" {
#       command = "terrahelp encrypt -simple-key=${var.random_string} -file=${local.global_values_keys_file}"
#   }
# }