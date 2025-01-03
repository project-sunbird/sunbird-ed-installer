# Sunbird-ED Installer

## Overview

This documentation explains how to install and configure Sunbird-ED on Azure, AWS, and GCP using the Sunbird-ED Installer. The instructions assume that you are familiar with cloud platforms and basic terminal commands. In the instructions below, `demo` is used as the example environment name. You can change it to match your environment, such as `dev`, `stage`, etc.

---

## Prerequisites

#### Pre-requisites

1. **Domain Name**
2. **SSL Certificate**: The FullChain, consisting of the private key and Certificate+CA_Bundle, is mandatory for installation.
3. **Google OAuth Credentials**: [Create credentials](https://developers.google.com/workspace/guides/create-credentials#oauth-client-id)
4. **Google V3 ReCaptcha Credentials**: [Create credentials](https://www.google.com/recaptcha/admin)
5. **Email Service Provider**
6. **MSG91 SMS Service Provider API Token** (Optional): Required for sending OTPs to registered email addresses during user registration or password reset.
7. **YouTube API Token** (Optional): Necessary for uploading video content directly via YouTube URL.

#### Required CLI Tools

1. [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
2. [jq](https://jqlang.github.io/jq/download/)
3. [rclone](https://rclone.org/)
4. [Terraform](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
5. [Terragrunt](https://terragrunt.gruntwork.io/docs/getting-started/install/)
6. Linux / MacOS / GitBash (Windows)
7. Python 3
8. PyJWT Python Package (install via pip)
9. [kubectl](https://kubernetes.io/docs/tasks/tools/)
10. [helm](https://helm.sh/docs/intro/quickstart/#install-helm)
11. [Postman CLI](https://learning.postman.com/docs/getting-started/installation/installation-and-updates/)

**Note:**

Existing files will be backed up with a `.bak` extension in the following locations, and new files will overwrite them:

- `~/.config/rclone/rclone.conf`
- `~/.kube/config`

---

## Installation Steps

### Clone the Repository

1. Clone the repository:

    ```bash
    git clone https://github.com/project-sunbird/sunbird-ed-installer.git
    ```

### Environment Configuration

The installer is configured for **Azure** by default. However, you can add support for **AWS** and **GCP** by updating the configuration files as explained below.

### Adding AWS and GCP Support

#### Installing Sunbird on GCP (Using the Azure folder as a reference to primarily create equivalent resources)

1. Create the `gcp` folder under `terraform`:

    ```bash
    mkdir -p sunbird-ed-installer/terraform/gcp
    ```

2. Organize the folder structure for GCP and write Terraform code to create the following resources:
    - GKE Cluster
    - Buckets [private and public]
    - Storage Account
    - Random String
    - Encryption String
    - JWT Tokens
    - RSA Keys

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
        # Copy the template folder from the Azure configuration:
        cp -r sunbird-ed-installer/terraform/azure/template sunbird-ed-installer/terraform/gcp
    ```

3. Add the below variable in `template/global-values.yaml` for GCP:

    ```yaml
    cloud_provider: gcp
    ```

**Update GKE configuration** in the **Helm charts** folder to use cloud-specific values based on the selected cloud provider.

In **Helm charts**, using a direct reference for **Azure**:

Example:

    ```yaml
    container_name: "{{ .Values.global.azure_telemetry_container_name }}"
    ```

Using `if-else` condition for multiple cloud providers:

    ```yaml
    container_name: 
        {{- if eq .Values.global.cloud_provider "azure" -}}
        "{{ .Values.global.azure_public_container_name }}"
        {{- else if eq .Values.global.cloud_provider "gcp" -}}
        "{{ .Values.global.gcp_public_bucket_name }}"
        {{- else -}}
        "unsupported-cloud-provider"
        {{- end }}
    ```

Other example:
- In `sunbird-ed-installer/helmcharts/obsrvbb/charts/flink/values.yaml`, modify the storage backend configuration:
   - For **GCP**:

    ```yaml
    {{- if eq "gcp" .Values.global.cloud_provider }}
    statebackend {
      gcs {
        storage {
          bucket = "{{ .Values.global.gcp_public_bucket_name }}"
          checkpointing.dir = "checkpoint"
        }
      }
    }
    base.url = "gs://"${job.statebackend.gcs.storage.bucket}"/"${job.statebackend.gcs.storage.checkpointing.dir}
    {{- else }}
    statebackend {
      blob {
        storage {
          account = "{{ .Values.global.azure_storage_account_name }}.blob.core.windows.net"
          container = "{{ .Values.global.azure_public_container_name }}"
          checkpointing.dir = "checkpoint"
        }
      }
    }
    base.url = "wasbs://"${job.statebackend.blob.storage.container}"@"${job.statebackend.blob.storage.account}"/"${job.statebackend.blob.storage.checkpointing.dir}
    {{- end }} 
    ```

Similarly, we need to go through all the configurations and update the support for GCP as well.

---

### Once GCP Support is Added

In the below instructions, `demo` is the environment name. You can change it as per your need. For example, `dev`, `stage`, etc.

1. Copy the template directory for GCP:

    ```bash
    cd terraform/gcp && cp -r template demo
    ```

2. Fill the variables in `demo/environment.hcl`.

3. Fill the variables in `demo/global-values.yaml`:

#### Mandatory variables in `global-values.yaml`:

|      Name      |   Description   |
|----------------|-----------------|
| `domain`       | Domain name     |
| `cloud_provider` | gcp           |
| `proxy_private_key` | SSL private key |
| `proxy_certificate` | SSL public key |

4. Set up the GCP credentials and login by running the following command:

    ```bash
    gcloud auth login
    ```

5. Run the installation script:

    ```bash
    time ./install.sh
    ```
    
#### Installing Sunbird on AWS (Using the Azure folder as a reference to primarily create equivalent resources)

1. Create the `aws` folder under `terraform`:

    ```bash
    mkdir -p sunbird-ed-installer/terraform/aws
    ```

2. Organize the folder structure for GCP and write Terraform code to create the following resources:
    - eks Cluster
    - Buckets [private and public]
    - Storage Account
    - Random String
    - Encryption String
    - JWT Tokens
    - RSA Keys

    ```plaintext
    terraform/aws/
    ├── _common
    │   ├── eks.hcl
    │   ├── keys.hcl
    │   ├── network.hcl
    │   ├── output-file.hcl
    │   ├── serviceaccount.hcl
    │   ├── storage.hcl
    │   └── upload-files.hcl
    ├── modules
    │   ├── eks
    │   ├── keys
    │   ├── network
    │   ├── output-file
    │   ├── serviceaccount
    │   ├── storage
    │   └── upload-files
    └── template/
        # Copy the template folder from the Azure configuration:
        cp -r sunbird-ed-installer/terraform/azure/template sunbird-ed-installer/terraform/aws
    ```

3. Add the below variable in `template/global-values.yaml` for AWS:

    ```yaml
    cloud_provider: aws
    ```

**Update AWS configuration** in the **Helm charts** folder to use cloud-specific values based on the selected cloud provider.

In **Helm charts**, using a direct reference for **Azure**:

Example:

    ```yaml
    container_name: "{{ .Values.global.azure_telemetry_container_name }}"
    ```

Using `if-else` condition for multiple cloud providers:

    ```yaml
    container_name: 
        {{- if eq .Values.global.cloud_provider "azure" -}}
        "{{ .Values.global.azure_public_container_name }}"
        {{- else if eq .Values.global.cloud_provider "aws" -}}
        "{{ .Values.global.aws_public_bucket_name }}"
        {{- else -}}
        "unsupported-cloud-provider"
        {{- end }}
    ```

Other example:
- In `sunbird-ed-installer/helmcharts/obsrvbb/charts/flink/values.yaml`, modify the storage backend configuration:
   - For **AWS**:

    ```yaml
    {- if eq "aws" .Values.global.cloud_provider }}
            statebackend {
              s3 {
                storage {
                  endpoint = "{{ .Values.oci_flink_s3_storage_endpoint }}"
                  container = "{{ .Values.global.aws_public_bucket_name }}"
                  checkpointing.dir = "checkpoint"
                }
              }
              base.url = "s3://"${job.statebackend.s3.storage.container}"/"${job.statebackend.s3.storage.checkpointing.dir}
            }
    {{- else }}
    statebackend {
      blob {
        storage {
          account = "{{ .Values.global.azure_storage_account_name }}.blob.core.windows.net"
          container = "{{ .Values.global.azure_public_container_name }}"
          checkpointing.dir = "checkpoint"
        }
      }
    }
    base.url = "wasbs://"${job.statebackend.blob.storage.container}"@"${job.statebackend.blob.storage.account}"/"${job.statebackend.blob.storage.checkpointing.dir}
    {{- end }} 
    ```

Similarly, we need to go through all the configurations and update the support for GCP as well.

---

### Once AWS Support is Added

In the below instructions, `demo` is the environment name. You can change it as per your need. For example, `dev`, `stage`, etc.

1. Copy the template directory for GCP:

    ```bash
    cd terraform/aws && cp -r template demo
    ```

2. Fill the variables in `demo/environment.hcl`.

3. Fill the variables in `demo/global-values.yaml`:

#### Mandatory variables in `global-values.yaml`:

|      Name      |   Description   |
|----------------|-----------------|
| `domain`       | Domain name     |
| `cloud_provider` | aws          |
| `proxy_private_key` | SSL private key |
| `proxy_certificate` | SSL public key |

4. Set up the AWS  credentials and login by running the following command:

```bash
export AWS_ACCESS_KEY_ID=<your-access-key-id>
export AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
export AWS_DEFAULT_REGION=<your-region>
```

Alternatively, you can use the `aws configure` method to set up the credentials:

```bash
aws configure
```

5. Run the installation script:

    ```bash
    time ./install.sh
    ```    

