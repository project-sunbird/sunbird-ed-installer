#!/bin/bash
set -euo pipefail

# Check if the global-values.yaml file exists
if [[ ! -f "global-values.yaml" ]]; then
  echo "Error: global-values.yaml file does not exist!"
  exit 1
fi

# Extract values using yq (YAML processor)
if ! command -v yq &> /dev/null; then
  echo "Error: yq is not installed. Please install yq to process YAML files."
  exit 1
fi

# Read values from global-values.yaml
building_block=$(yq '.global.building_block' global-values.yaml)
environment_name=$(yq '.global.environment' global-values.yaml)
location=$(yq '.global.cloud_storage_region' global-values.yaml)

# Validate that the values are extracted correctly
if [[ -z "$building_block" || -z "$environment_name" ]]; then
  echo "Error: Unable to extract values from global-values.yaml"
  exit 1
fi

# Debugging: Print extracted values
echo "Extracted building_block: \"$building_block\""
echo "Extracted environment_name: \"$environment_name\""

# Get Azure tenant ID (first segment of the Tenant ID)
ID=$(az account show | jq -r .tenantId | cut -d '-' -f1)

# Get Azure Subscription ID
SUBSCRIPTION_ID=$(az account show | jq -r .id)

# Construct resource names
RESOURCE_GROUP_NAME="${building_block}-${environment_name}"
STORAGE_ACCOUNT_NAME="${environment_name}tfstate$ID"
CONTAINER_NAME="${environment_name}tfstate"

# Debugging: Print generated names
echo "RESOURCE_GROUP_NAME: $RESOURCE_GROUP_NAME"
echo "STORAGE_ACCOUNT_NAME: $STORAGE_ACCOUNT_NAME"
echo "CONTAINER_NAME: $CONTAINER_NAME"
echo "SUBSCRIPTION_ID: $SUBSCRIPTION_ID"

# Create resource group
az group create --name "$RESOURCE_GROUP_NAME" --location "$location"

# Create the storage account
az storage account create --resource-group "$RESOURCE_GROUP_NAME" \
  --name "$STORAGE_ACCOUNT_NAME" --sku Standard_LRS --encryption-services blob

# Create the blob container
az storage container create --name "$CONTAINER_NAME" --account-name "$STORAGE_ACCOUNT_NAME"

# Export Terraform backend details to a file
echo "export AZURE_TERRAFORM_BACKEND_RG=$RESOURCE_GROUP_NAME" > tf.sh
echo "export AZURE_TERRAFORM_BACKEND_STORAGE_ACCOUNT=$STORAGE_ACCOUNT_NAME" >> tf.sh
echo "export AZURE_TERRAFORM_BACKEND_CONTAINER=$CONTAINER_NAME" >> tf.sh
echo "export AZURE_SUBSCRIPTION_ID=$SUBSCRIPTION_ID" >> tf.sh  # <-- Added Subscription ID export

echo -e "\nTerraform backend setup complete!"
echo -e "Run the following command to set the environment variables:"
echo "source tf.sh"
