output "grafana_admin_password" {
  value     = random_password.grafana_admin.result
  sensitive = true
}

output "superset_admin_password" {
  value     = random_password.superset_admin.result
  sensitive = true
}

output "keycloak_password" {
  value     = random_password.keycloak.result
  sensitive = true
}
output "postgresql_password" {
  value     = random_password.postgresql.result
  sensitive = true
}