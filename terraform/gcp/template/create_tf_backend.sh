#!/bin/bash
set -euo pipefail

# Check if the global-values.yaml file exists
if [[ ! -f "global-values.yaml" ]]; then
  echo "Error: global-values.yaml file does not exist!"
  exit 1
fi

# Check if required tools are installed
if ! command -v yq &> /dev/null; then
  echo "Error: yq is not installed. Please install yq to process YAML files."
  exit 1
fi

if ! command -v gcloud &> /dev/null; then
  echo "Error: gcloud CLI is not installed."
  exit 1
fi

# Read values from global-values.yaml
building_block=$(yq '.global.building_block' global-values.yaml)
environment_name=$(yq '.global.environment' global-values.yaml)
zone=$(yq ".global.zone" global-values.yaml)

# Extract region from zone
region=$(echo "$zone" | sed 's/-[a-z]$//')

# Construct bucket name
BUCKET_NAME="${environment_name}tfstate"

# Validate location
VALID_LOCATIONS=("africa-south1" "asia-east1" "asia-east2" "asia-northeast1" "asia-northeast2" "asia-northeast3" "asia-south1" "asia-south2" "asia-southeast1" "asia-southeast2" "australia-southeast1" "australia-southeast2" "europe-central2" "europe-north1" "europe-north2" "europe-southwest1" "europe-west1" "europe-west10" "europe-west12" "europe-west2" "europe-west3" "europe-west4" "europe-west6" "europe-west8" "europe-west9" "me-central1" "me-central2" "me-west1" "northamerica-northeast1" "northamerica-northeast2" "northamerica-south1" "southamerica-east1" "southamerica-west1" "us-central1" "us-east1" "us-east4" "us-east5" "us-south1" "us-west1" "us-west2" "us-west3" "us-west4")
if [[ ! " ${VALID_LOCATIONS[@]} " =~ " $region " ]]; then
  echo "Error: The specified location '$region' is not valid. Please provide a valid GCP location."
  exit 1
fi

# Validate required values
if [[ -z "$building_block" || -z "$environment_name" || -z "$region" ]]; then
  echo "Error: Unable to extract values from global-values.yaml"
  exit 1
fi

# Get current GCP project
GCP_PROJECT=$(gcloud config get-value project)
if [[ -z "$GCP_PROJECT" ]]; then
  echo "Error: GCP project is not set in gcloud CLI."
  exit 1
fi

# Validate bucket name
if [[ ! "$BUCKET_NAME" =~ ^[a-z0-9._-]+$ ]]; then
  echo "Error: Bucket name '$BUCKET_NAME' is invalid. It must contain only lowercase letters, numbers, dots, underscores, or hyphens."
  exit 1
fi

echo "Building block: $building_block"
echo "Environment: $environment_name"
echo "Zone: $zone"
echo "Region: $region"
echo "GCP Project: $GCP_PROJECT"
echo "Bucket Name: $BUCKET_NAME"

# Check if the bucket already exists
if gcloud storage buckets list --filter="name:$BUCKET_NAME" --format="value(name)" | grep -q "^$BUCKET_NAME$"; then
  echo "Bucket '$BUCKET_NAME' already exists. Skipping creation."
else
  echo "Creating GCS bucket '$BUCKET_NAME' in region '$region'..."
  gcloud storage buckets create "gs://$BUCKET_NAME" \
    --project="$GCP_PROJECT" \
    --location="$region" \
    --uniform-bucket-level-access

  # Enable versioning
  gcloud storage buckets update "gs://$BUCKET_NAME" --versioning
  echo "Bucket '$BUCKET_NAME' created and versioning enabled."
fi

# Write environment variables to tf.sh
echo "export TERRAFORM_GCP_PROJECT=$GCP_PROJECT" > tf.sh
echo "export TERRAFORM_BACKEND_BUCKET=$BUCKET_NAME" >> tf.sh

# Print out the result
echo -e "\nTerraform backend setup complete!"
echo "TERRAFORM_GCP_PROJECT=$GCP_PROJECT"
echo "TERRAFORM_BACKEND_BUCKET=$BUCKET_NAME"
echo "Run the following to export environment variables:"
echo "source tf.sh"
