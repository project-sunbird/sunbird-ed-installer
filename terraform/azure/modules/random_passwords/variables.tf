variable "grafana_admin_length" {
  type    = number
  default = 16
}

variable "grafana_admin_special" {
  type    = bool
  default = true
}

variable "superset_admin_length" {
  type    = number
  default = 16
}

variable "superset_admin_special" {
  type    = bool
  default = true
}

variable "keycloak_length" {
  type    = number
  default = 16
}

variable "keycloak_special" {
  type    = bool
  default = true
}
variable "postgresql_length" {
  type    = number
  default = 8
  
}