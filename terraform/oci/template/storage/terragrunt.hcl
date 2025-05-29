include "root" {
  path = find_in_parent_folders("terragrunt.hcl")
}

include "environment" {
  path = "${get_terragrunt_dir()}/../../_common/storage.hcl"
# This section will be enabled after final code is pushed and tagged
#  expose = true
}

# This section will be enabled after final code is pushed and tagged
# terraform {
#   source = "${include.environment.locals.source_base_url}?ref=v1.0.0"
# }

# module specific inputs
# inputs = {
#   var1 = "value1"
#   var2 = "value2"
# }