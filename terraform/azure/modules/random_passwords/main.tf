terraform {
  required_providers {
    azurerm = {
      version = "~> 4.0.1"
      source  = "hashicorp/azurerm"
    }
  }
}

resource "random_password" "grafana_admin" {
  length           = 16
  override_special = true
}

resource "random_password" "superset_admin" {
  length           = 16
  override_special = true
}

resource "random_password" "keycloak" {
  length           = 16
  override_special = true
}

resource "random_password" "postgresql" {
  length           = 16
  override_special = false
}

locals {
  patch_passwords_yaml = templatefile("${path.module}/patch-passwords.yaml.tpl", {
    grafana_admin_password  = random_password.grafana_admin.result
    superset_admin_password = random_password.superset_admin.result
    keycloak_password       = random_password.keycloak.result
    postgresql_password     = random_password.postgresql.result
  })
}

resource "local_file" "patch_passwords_file" {
  filename = "${path.module}/patch-passwords.yaml"
  content  = local.patch_passwords_yaml
}

resource "null_resource" "patch_global_values" {
  depends_on = [local_file.patch_passwords_file]

  triggers = {
    patch_file_sha = sha256(local_file.patch_passwords_file.content)
    always_run     = timestamp()
  }

  provisioner "local-exec" {
    command = <<EOT
    set -e
    echo "Starting merge process..."

    REPO_ROOT=$(cd ../../../../../ && pwd)
    GLOBAL_FILE="$REPO_ROOT/global-values.yaml"
    PATCH_FILE="${path.module}/patch-passwords.yaml"
    TMP_FILE="$REPO_ROOT/global-values.tmp"

    echo "GLOBAL_FILE: $GLOBAL_FILE"
    echo "PATCH_FILE: $PATCH_FILE"

    if [ ! -f "$GLOBAL_FILE" ]; then
      echo "Missing global-values.yaml"
      exit 1
    fi

    if [ ! -f "$PATCH_FILE" ]; then
      echo "Missing patch-passwords.yaml"
      exit 1
    fi

    yq eval '.default_passwords = load("'"$PATCH_FILE"'").default_passwords' "$GLOBAL_FILE" | tee "$TMP_FILE" >/dev/null
    mv "$TMP_FILE" "$GLOBAL_FILE"

    rm -f "$PATCH_FILE"
    echo "Merge complete"
    EOT
  }
}