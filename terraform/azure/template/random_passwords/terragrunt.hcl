include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

include "environment" {
  path = "${get_terragrunt_dir()}/../../_common/random_passwords.hcl"
# This section will be enabled after final code is pushed and tagged
#  expose = true
}
