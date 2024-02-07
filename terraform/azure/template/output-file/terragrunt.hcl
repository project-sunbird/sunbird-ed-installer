include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

include "environment" {
  path = "${get_terragrunt_dir()}/../../_common/output-file.hcl"
# This section will be enabled after final code is pushed and tagged
#  expose = true
}

# This section will be enabled after final code is pushed and tagged
# terraform {
#   source = "${include.environment.locals.source_base_url}?ref=v1.0.0"
# }

# module specific inputs
inputs = {
  base_location = get_terragrunt_dir()
}