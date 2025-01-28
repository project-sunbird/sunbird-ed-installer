# sunbird-ed-installer

## Installing sunbird on Azure

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

We will copy your existing files in the below location with a `.bak` extension and create overwrite the below files
- `~/.config/rclone/rclone.conf`
- `~/.kube/config`

- In the below instructions `demo` is the environement name. You can change it as per your need. For example - `dev`, `stage` etc.
- Clone the repo
`git clone https://github.com/project-sunbird/sunbird-ed-installer.git`
- Copy the template directory `cd terraform/azure && cp -r template demo`
- Fill the variables in `demo/environment.hcl`
- Fill the variables in `demo/global-values.yaml`
- Run `az login --tenant AZURE_TENANT_ID`
- Run `time ./install.sh`

#### Mandatory variables in `environment.hcl`
|      Name      |   Description    |
|----------------|------------------|
|`environment`   | Environment name (between 1 - 9 charcaters). Example: *dev*, *stage* |

#### Mandatory variables in `global-values.yaml`
|      Name      |   Description   |
|----------------|-----------------|
|`domain`           | Domain name  |
|`proxy_private_key` | SSL private key |
|`proxy_certificate` | SSL public key |

## Installation Steps

1. Create environment folder

```bash
cd terraform/<cloud>
cp -rf template dev
cd dev
```
2. Update required values in `environment.hcl` and `global-values.yaml` files
3. Run `bash install.sh`

## Client form setup
To setup client forms - Run  the install.sh with the function create_client_forms

`bash install.sh create_client_forms`

## Default users in the instance 
This installation setup creates the following default users with different roles. Feel free to update the password using "Forgot password" option or create new users using API's

|Role	|Email/User Name	|Password|
|-----|-----------------|----------|
|Admin	|admin@yopmail.com	| Admin@123|
|Content Creator|	contentcreator@yopmail.com	| Creator@123|
|Content Reviewer |	contentreviewer@yopmail.com |	Reviewer@123|
|Book Creator	| bookcreator@yopmail.com	| Bookcreator@123|
|Book Reviewer	| bookreviewer@yopmail.com	| bookReviewer@123|
|Public User 1	| user1@yopmail.com	| User1@123|
|Public User 2	| user2@yopmail.com	| User2@123|
   
