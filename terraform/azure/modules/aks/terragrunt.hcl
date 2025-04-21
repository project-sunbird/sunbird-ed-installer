include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

inputs = {
  azure_subscription_id = get_env("AZURE_SUBSCRIPTION_ID")
}
