
output "encryption_string" {
  value = random_password.encryption_string.result
  sensitive = true
}
output "randam_string" {
  value = random_password.generated_string.result
  sensitive = true
}
