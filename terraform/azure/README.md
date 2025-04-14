# Azure

Follow this document if you are setting up Sunbird-Ed on Azure

#### Required tools and permisions
1. Azure CLI (https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
2. Ensure that the user or service principal running the Terraform script has the necessary prvileges as [listed here](https://registry.terraform.io/providers/hashicorp/azuread/latest/docs/resources/application#api-permissions)

**Note:**
We will overwrite the following files. Please take a backup of your existing files in the following locations
- `~/.config/rclone/rclone.conf`
- 

### Authentication

Post installation of the CLI tool and providing necessary permissions, use the following command to login to Azure via CLI. 

```
az login --tenant <AZURE_TENANT_ID>
```

Note: Make sure you replace the AZURE_TENANT_ID with the tenant id from Azure Console. 

#### Azure Infra Setup

Post login, update the `terraform/azure/<env>/global-values.yaml` with the variables as per your environment

```
  building_block: "" # building block name
  env: "" 
  environment: "" # use lowercase alphanumeric string between 1-9 characters
  domain: ""
  subscription_id: ""
  sunbird_cloud_storage_provider: azure 
  sunbird_google_captcha_site_key: 
  google_captcha_private_key: 
  sunbird_google_oauth_clientId: 
  sunbird_google_oauth_clientSecret: 
  mail_server_from_email: ""
  mail_server_password: ""
  mail_server_host: smtp.sendgrid.net
  mail_server_port: "587"
  mail_server_username: apikey
  sunbird_msg_91_auth: ""
  sunbird_msg_sender: ""
  youtube_apikey: ""
  proxy_private_key: |
   <private_key_generated_when_setting_up_ssl>
  proxy_certificate: |
   <certificate_generated_when_setting_up_ssl>
```

