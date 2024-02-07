### Creating infrastructure using terraform

The installer can be run on one of the following platform
- Linux
- Macos
- Windows (requires git for windows https://gitforwindows.org/)

#### Required CLI tools
1. Azure CLI (https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
2. jq (https://jqlang.github.io/jq/download/)
3. rclone (https://rclone.org/)
4. Terraform (https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
5. Terragrunt (https://terragrunt.gruntwork.io/docs/getting-started/install/)
6. Python 3 (https://www.python.org/downloads/)
7. PyJwt python package (https://pypi.org/project/PyJWT/)
8. Postman CLI (https://learning.postman.com/docs/postman-cli/postman-cli-installation/)

#### CLI Versions
The installer doesn't require a particular CLI version, but we have documented the version that has been utilized and verified. If a future release of the CLI tool introduces a breaking change, it could result in installation failure. If you experience such an issue, kindly create a GitHub issue, and we'll work on resolving it.

#### Terraform Backend Setup
```
git clone https://github.com/nimbushubin/sunbird.git
cd terraform/azure
az login --tenant AZURE_TENANT_ID
bash create_tf_backend.sh dev

# The script will ask you to export few variables which looks similar to this

export AZURE_TERRAFORM_BACKEND_RG=devtfstate
export AZURE_TERRAFORM_BACKEND_STORAGE_ACCOUNT=devtfstateef0d3992
export AZURE_TERRAFORM_BACKEND_CONTAINER=devtfstate
```

**Note:**

We will overwrite the following files. Please take a backup of your existing files in the following locations
- `~/.config/rclone/rclone.conf`


#### Azure Infra Setup
```
terraform/azure/dev
terragrunt init
terragrunt run-all validate
terragrunt run-all plan
# Enter y in the next command
terragrunt run-all apply
```