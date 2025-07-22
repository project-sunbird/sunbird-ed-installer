terraform {
  required_providers {
    azurerm = {
      version = "~> 4.0.1"
      source  = "hashicorp/azurerm"
    }
  }
}

resource "random_password" "grafana_admin" {
  length  = var.grafana_admin_length
  special = var.grafana_admin_special
}

resource "random_password" "superset_admin" {
  length  = var.superset_admin_length
  special = var.superset_admin_special
}

resource "random_password" "keycloak" {
  length  = var.keycloak_length
  special = var.keycloak_special
}

resource "random_password" "postgresql" {
  length  = var.postgresql_length
  special = var.postgresql_special
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

# resource "null_resource" "patch_global_values" {
#   depends_on = [local_file.patch_passwords_file]

#   triggers = {
#     patch_file_sha = sha256(local_file.patch_passwords_file.content)
#   }

#   provisioner "local-exec" {
#     command = <<EOT
# echo "🔄 Starting merge process..."

# # Set REPO_ROOT relative to current directory of this module (2 levels up)
# REPO_ROOT=$(cd ../../../../../ && pwd)

# GLOBAL_FILE="$REPO_ROOT/global-values.yaml"
# PATCH_FILE="$REPO_ROOT/modules/random_passwords/patch-passwords.yaml"
# TMP_FILE="$REPO_ROOT/modules/random_passwords/global-values.tmp"

# echo "📁 REPO_ROOT = $REPO_ROOT"
# echo "🔍 Checking files:"
# ls -l "$GLOBAL_FILE" || { echo "❌ Missing global-values.yaml at $GLOBAL_FILE"; exit 1; }
# ls -l "$PATCH_FILE" || { echo "❌ Missing patch-passwords.yaml at $PATCH_FILE"; exit 1; }

# echo "🔀 Merging..."
# yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' \
#   "$GLOBAL_FILE" "$PATCH_FILE" > "$TMP_FILE" && \
#   mv "$TMP_FILE" "$GLOBAL_FILE"

# echo "✅ Merge complete: $GLOBAL_FILE updated."
# EOT
#   }
# }
resource "null_resource" "patch_global_values" {
  depends_on = [local_file.patch_passwords_file]

  triggers = {
    patch_file_sha = sha256(local_file.patch_passwords_file.content)
  }

  provisioner "local-exec" {
    command = <<EOT
echo "🔄 Starting merge process..."

# Adjust this to the folder containing global-values.yaml
REPO_ROOT=$(cd ../../../../../ && pwd)

GLOBAL_FILE="$REPO_ROOT/global-values.yaml"
PATCH_FILE="$REPO_ROOT/patch-passwords.yaml"
TMP_FILE="$REPO_ROOT/global-values.tmp"

echo "📁 REPO_ROOT = $REPO_ROOT"
echo "🔍 Checking files:"

if [ ! -f "$GLOBAL_FILE" ]; then
  echo "❌ Missing global-values.yaml at $GLOBAL_FILE"
  exit 1
fi

# Create patch file with content from local_file.patch_passwords_file.content
echo "📝 Creating patch file at $PATCH_FILE"
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

echo "✅ Merge complete: $GLOBAL_FILE updated and patch file deleted."
EOT
  }
}
