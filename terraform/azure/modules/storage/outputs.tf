output "azurerm_storage_account_name" {
  value = azurerm_storage_account.storage_account.name
}

output "azurerm_storage_account_key" {
  value = azurerm_storage_account.storage_account.primary_access_key
  sensitive = true
}

output "azurerm_storage_container_private" {
  value = azurerm_storage_container.storage_container_private.name
}

output "azurerm_storage_container_public" {
  value = azurerm_storage_container.storage_container_public.name
}

output "azurerm_dial_state_container_public" {
  value = azurerm_storage_container.dial_state_container_public.name
}