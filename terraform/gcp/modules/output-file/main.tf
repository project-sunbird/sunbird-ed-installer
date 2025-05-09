locals {
  global_values_cloud_file = "${var.base_location}/../global-cloud-values.yaml"
}

resource "local_sensitive_file" "global_cloud_values_yaml" {
content  = templatefile("${path.module}/global-cloud-values.yaml.tfpl", {
    env                                           = var.env,
    environment                                   = var.environment,
    building_block                                = var.building_block,
    gcp_storage_account_email                     = var.gcp_storage_account_mail,
    gcp_storage_account_key                       = var.gcp_storage_bucket_key,
    gcp_public_container_name                     = var.storage_container_public,
    gcp_private_container_name                    = var.storage_container_private,
    gcp_dial_state_container_public               = var.dial_state_container_public,
    random_string                                 = var.random_string,
    private_ingressgateway_ip                     = var.private_ingressgateway_ip,
    encryption_string                             = var.encryption_string,
    gcp_project_id                                = var.gcp_project_id
    storage_class                                 = var.storage_class
    cloud_storage_provider                        = var.cloud_storage_provider
    cloud_storage_region                          = var.cloud_storage_region
  })
  filename = local.global_values_cloud_file
}

resource "null_resource" "upload_global_cloud_values_yaml" {
  triggers = {
    command = "${timestamp()}"
  }
  provisioner "local-exec" {
    command = "gsutil cp ${local.global_values_cloud_file} gs://${var.storage_container_private}/${var.environment}-global-cloud-values.yaml"
  }
  depends_on = [ local_sensitive_file.global_cloud_values_yaml ]
}