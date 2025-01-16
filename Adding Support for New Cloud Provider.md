# Adding Support for a New Cloud Provider

## Requirements

### Cluster Specifications
- **Minimum Requirements:**
  - CPU: 48 vCPUs
  - Memory: 192 GB
- **Recommended Node Size:**
  - 3 nodes of `Standard_B16as_v2` (16 vCPUs, 64 GB RAM)

 ### Networking
  - Public Subnet  

### Storage Buckets
- Create the following buckets:
  1. `storage_container_private`
  2. `storage_container_public`
  3. `reports_container_private`
  4. `telemetry_container_private`
  5. `backups_container_private`
  6. `flink_state_container_private`
  7. `dial_state_container_public`

### Additional Requirements
1. Storage Account
2. Random String
3. Encryption String
4. JWT Tokens
5. RSA Keys

---

## Steps to Add a New Cloud Provider

### Step 1: Create a New Folder
- Navigate to the `terraform` directory and create a folder for the new cloud provider.
  Example: `terraform/gcp/`

### Step 2: Recommended Folder Structure
- Organize the folder as follows:
```plaintext
terraform/gcp/
├── _common
│   ├── gke.hcl
│   ├── keys.hcl
│   ├── network.hcl
│   ├── output-file.hcl
│   ├── serviceaccount.hcl
│   ├── storage.hcl
│   └── upload-files.hcl
├── modules
│   ├── gke
│   ├── keys
│   ├── network
│   ├── output-file
│   ├── serviceaccount
│   ├── storage
│   └── upload-files
└── template/
    ├── gke
    │   └── terragrunt.hcl
    ├── create_tf_backend.sh
    ├── environment.hcl
    ├── global-values.yaml
    ├── install.sh
    ├── keys
    │   └── terragrunt.hcl
    ├── network
    │   └── terragrunt.hcl
    ├── output-file
    │   └── terragrunt.hcl
    ├── postman.env.json
    ├── storage
    │   └── terragrunt.hcl
    ├── terragrunt.hcl
    └── upload-files
        └── terragrunt.hcl

    # Copy the template files conetent  from the Azure configuration:
    cp sunbird-ed-installer/terraform/azure/template/{environment.hcl,global-values.yaml,install.sh} sunbird-ed-installer/terraform/gcp/template/
```
 
 ### Step 3: Structuting Output Files
This will become the input for helm bundles
```
  global-cloud-values.yaml
  environment.hcl
  global-values.yaml 
  ```

### Step 4: Helm Changes


In helm charts, whereever cloud values are being referred, use the following format:
```
{{- if eq .Values.global.cloud_provider "aws" }}
# AWS Specific Values
{{- else if eq .Values.global.cloud_provider"gcp" }}
# GCP Specific Values
{{- end }}
```

 example
 In **Helm charts**, using a direct reference for **Azure**:

 Example:
 
    
     container_name: "{{ .Values.global.azure_telemetry_container_name }}"
     
 
 Using `if-else` condition for multiple cloud providers:
 
    
     container_name: 
     {{- if eq .Values.global.cloud_provider "aws" -}}
     "{{ .Values.global.aws_public_bucket_name }}"
     {{- else if eq .Values.global.cloud_provider "gcp" -}}
     "{{ .Values.global.gcp_public_bucket_name }}"
     {{- else -}}
     "{{ .Values.global.azure_public_container_name }}"
     {{- end }}
     

     

