# ---------------------------------------------------------------------------------------------------------------------
# REQUIRED PARAMETERS
# These parameters must be supplied when consuming this module.
# ---------------------------------------------------------------------------------------------------------------------

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

variable "project" {
  description = "The project ID to host the cluster in"
  type        = string
}

variable "location" {
  description = "The location (region or zone) to host the cluster in"
  type        = string
}

variable "zone" {
  description = "The zone for the cluster. If the cluster is regional, this should be one of the zones in the region. Otherwise, this should be the same zone as the region."
  type        = string
  default = "asia-south1-a"
}

variable "gke_node_default_disk_size_gb" {
  description = "Default disk size for GKE nodes"
  type        = number
  default     = 30
}

## VPC

variable "create_network" {
  description = "Create a new VPC network."
  type        = bool
  default     = false
}

variable "network" {
  description = "A reference (self link) to the VPC network to host the cluster in"
  type        = string
}

variable "subnetwork" {
  description = "A reference (self link) to the subnetwork to host the cluster in"
  type        = string
}

variable "cluster_secondary_range_name" {
  description = "The name of the secondary range within the subnetwork for the cluster to use"
  type        = string
  default = ""
}

variable "deletion_protection" {
  description = "Whether to enable deletion protection for the cluster"
  type        = bool
  default     = false
}

# ---------------------------------------------------------------------------------------------------------------------
# OPTIONAL PARAMETERS
# Generally, these values won't need to be changed.
# ---------------------------------------------------------------------------------------------------------------------

variable "description" {
  description = "The description of the cluster"
  type        = string
  default     = "sunbird-ed cluster"
}

variable "kubernetes_version" {
  description = "The Kubernetes version of the masters. If set to 'latest' it will pull latest available version in the selected region."
  type        = string
  default     = "latest"
}

variable "gke_node_pool_instance_type" {
  type        = string
  description = "GKE nodepool instance types."
  default     = "n2d-standard-16"
}

variable "gke_node_pool_scaling_config" {
  type        = map(number)
  description = "EKS node group auto scaling configuration."
  default     = {
    desired_size = 3
    min_size = 3
    max_size = 3
  }
}

variable "gke_node_pool_network_tags" {
  type        = list(string)
  description = "List of networks to attach to the node pool"
  default = [  ]
}

variable "kubernetes_storage_class" {
  type        = string
  description = "Storage class name for the GKE cluster"
  default     = "pd-ssd"
}

variable "kubernetes_storage_class_raw" {
  type        = string
  description = "Storage class name in raw format, they use a different notation than the GKE cluster"
  default     = "premium-rwo"
}

variable "gke_node_pool_preemptible" {
  type        = bool
  description = "Whether to use preemptible nodes for the GKE cluster; use `true` for fault-tolerant workloads, `false` otherwise. Ref: https://cloud.google.com/kubernetes-engine/docs/how-to/preemptible-vms"
  default     = false
}

variable "logging_service" {
  description = "The logging service that the cluster should write logs to. Available options include logging.googleapis.com/kubernetes, logging.googleapis.com (legacy), and none"
  type        = string
  default     = "logging.googleapis.com/kubernetes"
}


variable "horizontal_pod_autoscaling" {
  description = "Whether to enable the horizontal pod autoscaling addon"
  type        = bool
  default     = true
}

variable "http_load_balancing" {
  description = "Whether to enable the http (L7) load balancing addon"
  type        = bool
  default     = true
}

variable "gcp_filestore_csi_driver" {
  description = "Whether to enable the Filestore CSI driver addon"
  type        = bool
  default     = true
}

variable "gce_persistent_disk_csi_driver" {
  description = "Whether to enable the Google Compute Engine Persistent Disk Container Storage Interface (CSI) Driver addon"
  type        = bool
  default     = true
}

variable "enable_private_nodes" {
  description = "Control whether nodes have internal IP addresses only. If enabled, all nodes are given only RFC 1918 private addresses and communicate with the master via private networking."
  type        = bool
  default     = false
}

variable "disable_public_endpoint" {
  description = "Control whether the master's internal IP address is used as the cluster endpoint. If set to 'true', the master can only be accessed from internal IP addresses."
  type        = bool
  default     = false
}

variable "master_ipv4_cidr_block" {
  description = "The IP range in CIDR notation to use for the hosted master network. This range will be used for assigning internal IP addresses to the master or set of masters, as well as the ILB VIP. This range must not overlap with any other ranges in use within the cluster's network."
  type        = string
  default     = ""
}

variable "network_project" {
  description = "The project ID of the shared VPC's host (for shared vpc support)"
  type        = string
  default     = ""
}

variable "master_authorized_networks_config" {
  description = <<EOF
  The desired configuration options for master authorized networks. Omit the nested cidr_blocks attribute to disallow external access (except the cluster node IPs, which GKE automatically whitelists)
  ### example format ###
  master_authorized_networks_config = [{
    cidr_blocks = [{
      cidr_block   = "10.0.0.0/8"
      display_name = "example_network"
    }],
  }]
EOF
  type        = list(any)
  default     = []
}

variable "maintenance_start_time" {
  description = "Time window specified for daily maintenance operations in RFC3339 format"
  type        = string
  default     = "05:00"
}

variable "alternative_default_service_account" {
  description = "Alternative Service Account to be used by the Node VMs. If not specified, the default compute Service Account will be used. Provide if the default Service Account is no longer available."
  type        = string
  default     = null
}

variable "resource_labels" {
  description = "The GCE resource labels (a map of key/value pairs) to be applied to the cluster."
  type        = map(any)
  default     = {}
}

# ---------------------------------------------------------------------------------------------------------------------
# OPTIONAL PARAMETERS - RECOMMENDED DEFAULTS
# These values shouldn't be changed; they're following the best practices defined at https://cloud.google.com/kubernetes-engine/docs/how-to/hardening-your-cluster
# ---------------------------------------------------------------------------------------------------------------------

variable "enable_legacy_abac" {
  description = "Whether to enable legacy Attribute-Based Access Control (ABAC). RBAC has significant security advantages over ABAC."
  type        = bool
  default     = false
}

variable "enable_network_policy" {
  description = "Whether to enable Kubernetes NetworkPolicy on the master, which is required to be enabled to be used on Nodes."
  type        = bool
  default     = true
}

variable "basic_auth_username" {
  description = "The username used for basic auth; set both this and `basic_auth_password` to \"\" to disable basic auth."
  type        = string
  default     = ""
}

variable "basic_auth_password" {
  description = "The password used for basic auth; set both this and `basic_auth_username` to \"\" to disable basic auth."
  type        = string
  default     = ""
}

variable "secrets_encryption_kms_key" {
  description = "The Cloud KMS key to use for the encryption of secrets in etcd, e.g: projects/my-project/locations/global/keyRings/my-ring/cryptoKeys/my-key"
  type        = string
  default     = null
}
 variable "gsuite_domain_name" {  
  description = "The G Suite domain name to use for the cluster"
  type        = string
  default     = ""
   
 }

# See https://cloud.google.com/kubernetes-engine/docs/concepts/verticalpodautoscaler
variable "enable_vertical_pod_autoscaling" {
  description = "Whether to enable Vertical Pod Autoscaling"
  type        = string
  default     = false
}

variable "services_secondary_range_name" {
  description = "The name of the secondary range within the subnetwork for the services to use"
  type        = string
  default     = null
}

variable "enable_workload_identity" {
  description = "Enable Workload Identity on the cluster"
  default     = true
  type        = bool
}

variable "identity_namespace" {
  description = "Workload Identity Namespace. Default sets project based namespace [project_id].svc.id.goog"
  default     = ""
  type        = string
}

variable "private_ingressgateway_ip" {
    type        = string
    description = "Nginx private ingress ip."
    default = "10.0.0.10"
}