# sunbird-ed-installer

## Installing sunbird 

## common for all cloud provider
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


Note:

We will copy your existing files in the below location with a .bak extension and create overwrite the below files

~/.config/rclone/rclone.conf

~/.kube/config

In the below instructions demo is the environement name. You can change it as per your need. For example - dev, stage etc.

Clone the repo git clone https://github.com/project-sunbird/sunbird-ed-installer.git


Step 1: Create a folder named gcp[sunbird-ed-installer/terraform/gcp]. Refer to the azure folder for guidance[sunbird-ed-installer/terraform/azure], as it contains Terraform modules for creating clusters and containers. Use it as a reference to set up the environment for GCP
 "Inside the gcp folder, the following structure is present:
    _common
        gke.hcl
        keys.hcl
        network.hcl
        output-file.hcl
        serviceaccount.hcl
        storage.hcl
        upload-files.hcl
    modules
        gke
        keys
        network
        output-file
        serviceaccount
        storage
        upload-files
    template/
     Modify the template folder to support GCP resources
This setup will include the creation of a GKE cluster, service account, buckets, as well as private and public keys






