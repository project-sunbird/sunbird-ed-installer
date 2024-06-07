#!/bin/bash
set -euo pipefail

environment=$1
ID=$(az account show | jq -r .tenantId | cut -d '-' -f1)
RESOURCE_GROUP_NAME=${environment}tfstate
STORAGE_ACCOUNT_NAME=${environment}tfstate$ID
CONTAINER_NAME=${environment}tfstate

# Create resource group
az group create --name $RESOURCE_GROUP_NAME --location eastus2

# Create storage account
az storage account create --resource-group $RESOURCE_GROUP_NAME --name $STORAGE_ACCOUNT_NAME --sku Standard_LRS --encryption-services blob

# Create blob container
az storage container create --name $CONTAINER_NAME --account-name $STORAGE_ACCOUNT_NAME

echo "export AZURE_TERRAFORM_BACKEND_RG=$RESOURCE_GROUP_NAME" > tf.sh
echo "export AZURE_TERRAFORM_BACKEND_STORAGE_ACCOUNT=$STORAGE_ACCOUNT_NAME" >> tf.sh
echo "export AZURE_TERRAFORM_BACKEND_CONTAINER=$CONTAINER_NAME" >> tf.sh

echo -e "\nIf you need to run terraform commands manually, run the following command in your terminal to export the necessary environment variables"

echo "\nsource tf.sh"