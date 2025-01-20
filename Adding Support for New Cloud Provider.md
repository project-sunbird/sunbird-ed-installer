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
Create the following buckets:
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
Organize the folder as follows:
```plaintext
terraform/<cloud_provider>/
├── _common
│   ├── kubernetescluster.hcl
│   ├── keys.hcl
│   ├── network.hcl
│   ├── output-file.hcl
│   ├── serviceaccount.hcl
│   ├── storage.hcl
│   └── upload-files.hcl
├── modules
│   ├── kubernetescluster
│   ├── keys
│   ├── network
│   ├── output-file
│   ├── serviceaccount
│   ├── storage
│   └── upload-files
└── template/
    ├── kubernetescluster
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
```

### Step 3: Copy Template Files
Copy the template files from the Azure configuration:
```sh
cp sunbird-ed-installer/terraform/azure/template/{environment.hcl,global-values.yaml,install.sh} sunbird-ed-installer/terraform/gcp/template/
In global-values.yaml, add this variable:
cloud_provider: "REPLACE_ME" # for configuring GCP and AWS installations
```

### Step 4: Structuring Output Files
This will become the input for Helm bundles:
```plaintext
  global-cloud-values.yaml
  environment.hcl
  global-values.yaml 
```

### Step 5: Helm Changes
In Helm charts, wherever cloud values are being referred to, use the following format:
```yaml
{{- if eq .Values.global.cloud_provider "aws" }}
# AWS Specific Values
{{- else if eq .Values.global.cloud_provider "gcp" }}
# GCP Specific Values
{{- end }}
```

#### Example:
In **Helm charts**, using a direct reference for **Azure**:
```yaml
container_name: "{{ .Values.global.azure_telemetry_container_name }}"
```

Using an `if-else` condition for multiple cloud providers:
```yaml
container_name: 
  {{- if eq .Values.global.cloud_provider "aws" }}
  "{{ .Values.global.aws_public_bucket_name }}"
  {{- else if eq .Values.global.cloud_provider "gcp" }}
  "{{ .Values.global.gcp_public_bucket_name }}"
  {{- else }}
  "{{ .Values.telemetry_container_private }}"
  {{- end }}
```

### Step 6: Enable Service Account and Add Annotations 
When using storage buckets, ensure the appropriate service account is enabled and annotated
For example:
```yaml
serviceAccount:
  create: true
  name: <created at step 2>
  annotations:
    iam.gke.io/gcp-service-account: iam.gke.io/gcp-service-account: <service-account-name>@<project-id>.iam.gserviceaccount.com
```

For **Azure installation**, please refer to the documentation:
`/sunbird-ed-installer/README.md`

