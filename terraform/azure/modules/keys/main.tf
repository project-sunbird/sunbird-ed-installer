provider "tls" {}

locals {
  global_values_keys_file = "${var.base_location}/../global-keys-values.yaml"
  jwt_script_location = "${var.base_location}/../../../../scripts/jwt-keys.py"
  rsa_script_location = "${var.base_location}/../../../../scripts/rsa-keys.py"
  global_values_jwt_file_location = "${var.base_location}/../../../../scripts/global-values-jwt-tokens.yaml"
  global_values_rsa_file_location = "${var.base_location}/../../../../scripts/global-values-rsa-keys.yaml"
}
resource "random_password" "generated_string" {
  length  = 16          # Length of the string (can be between 12 and 24)
  special = false        # Do not include special characters
  upper   = true         # Include uppercase letters
  lower   = true         # Include lowercase letters
  numeric = true         # Include numbers
}
resource "random_password" "encryption_string" {
  length  = 32          # Length of the string (can be between 32)
  special = false        # Do not include special characters
  upper   = true         # Include uppercase letters
  lower   = true         # Include lowercase letters
  numeric = true         # Include numbers
}


resource "null_resource" "generate_jwt_keys" {
  triggers = {
    command = "${timestamp()}"
  }

  #working 
  provisioner "local-exec" {
    command = <<EOT
      python3 ${local.jwt_script_location} ${random_password.generated_string.result} && \
      yq eval-all 'select(fileIndex == 0) *+ {"global": (select(fileIndex == 0).global * load("${local.global_values_jwt_file_location}"))}' -i ${var.base_location}/../global-values.yaml

    EOT
  }
}


resource "null_resource" "generate_rsa_keys" {
   triggers = {
    command = "${timestamp()}"
  }

 provisioner "local-exec" {
  command = <<EOT
    python3 ${local.rsa_script_location} ${var.rsa_keys_count} && \
    yq eval-all 'select(fileIndex == 0) *+ {"global": (select(fileIndex == 0).global * load("${local.global_values_rsa_file_location}"))}' -i ${var.base_location}/../global-values.yaml
  EOT
}
}

resource "null_resource" "upload_global_jwt_values_yaml" {
  triggers = {
    command = "${timestamp()}"
  }
  provisioner "local-exec" {
      command = "az storage blob upload --account-name ${var.storage_account_name} --account-key ${var.storage_account_primary_access_key} --container-name ${var.storage_container_private}  --file ${var.base_location}/../../../../scripts/global-values-jwt-tokens.yaml --name ${var.environment}-global-values-jwt-tokens.yaml --overwrite"
  }
  depends_on = [ null_resource.generate_jwt_keys ]
}

resource "null_resource" "upload_global_rsa_values_yaml" {
  triggers = {
    command = "${timestamp()}"
  }
  provisioner "local-exec" {
      command = "az storage blob upload --account-name ${var.storage_account_name} --account-key ${var.storage_account_primary_access_key} --container-name ${var.storage_container_private} --file ${var.base_location}/../../../../scripts/global-values-rsa-keys.yaml --name ${var.environment}-global-values-rsa-keys.yaml --overwrite"
  }
  depends_on = [ null_resource.generate_rsa_keys ]
}

# Sample code to enable encryption of global values files
# Encrypted files cannot be passed to helm

# resource "null_resource" "terrahelp_encryption" {
#   triggers = {
#     command = "${timestamp()}"
#   }
#   provisioner "local-exec" {
#       command = "terrahelp encrypt -simple-key=${random_password.generated_string.result} } -file=${local.global_values_keys_file}"
#   }
# }


