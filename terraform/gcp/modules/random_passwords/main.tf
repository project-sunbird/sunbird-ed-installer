terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
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
  }

  provisioner "local-exec" {
    command = <<EOT
echo "🔄 Starting merge process..."

REPO_ROOT=$(cd ../../../../../ && pwd)
GLOBAL_FILE="$REPO_ROOT/global-values.yaml"
PATCH_FILE="$REPO_ROOT/patch-passwords.yaml"
TMP_FILE="$REPO_ROOT/global-values.tmp"

echo " REPO_ROOT = $REPO_ROOT"
echo " Checking files..."

if [ ! -f "$GLOBAL_FILE" ]; then
  echo " Missing global-values.yaml at $GLOBAL_FILE"
  exit 1
fi

echo " Creating patch file at $PATCH_FILE"
cat <<EOF > "$PATCH_FILE"
${local_file.patch_passwords_file.content}
EOF

ls -l "$GLOBAL_FILE"
ls -l "$PATCH_FILE"

echo "🔀 Merging files..."
yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' \
  "$GLOBAL_FILE" "$PATCH_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$GLOBAL_FILE"

echo "🧹 Removing patch file..."
rm -f "$PATCH_FILE"

echo " Merge complete: $GLOBAL_FILE updated."
EOT
  }
}
