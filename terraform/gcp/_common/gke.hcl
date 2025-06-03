locals {
  # This section will be enabled after final code is pushed and tagged
  # source_base_url = "github.com/<org>/modules.git//app"
  global_vars  = yamldecode(file(find_in_parent_folders("global-values.yaml")))
  environment  = local.global_vars.global.environment
  building_block = local.global_vars.global.building_block
  project = local.global_vars.global.cloud_storage_project
  zone = local.global_vars.global.zone
  location= local.global_vars.global.cloud_storage_region 
  create_network= local.global_vars.global.create_network
  gke_node_pool_instance_type= local.global_vars.global.gke_node_pool_instance_type
  gke_node_default_disk_size_gb= local.global_vars.global.gke_node_default_disk_size_gb
  region = local.global_vars.global.cloud_storage_region
  env = local.global_vars.global.env
  # random_string  = local.environment_vars.locals.random_string 
}

# For local development
terraform {
  source = "../../modules//gke/"
}

dependency "network" {
    config_path = "../network"
    mock_outputs = {
    network = "sunbird-vpc"
    public_subnetwork = "dummy"
    subnetwork = "dummy"
    public_services_secondary_range_name = "dummy"
    }
}

inputs = {
  environment                        = local.environment
  building_block                     = local.building_block
  network                            = dependency.network.outputs.network
  subnetwork                         = dependency.network.outputs.public_subnetwork
  cluster_secondary_range_name      = dependency.network.outputs.public_services_secondary_range_name
  project                            = local.project
  zone                               = local.zone
  region                             = local.region
  location                           = local.location
  create_network                     = local.create_network
  gke_node_pool_instance_type        = local.gke_node_pool_instance_type
  gke_node_default_disk_size_gb      = local.gke_node_default_disk_size_gb
  env                              = local.env
}