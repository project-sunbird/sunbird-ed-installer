#!/bin/bash
set -euox pipefail

# Database connection parameters with default values
POSTGRES_HOST="${POSTGRES_HOST:-postgresql}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-keycloak}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
PGPASSWORD="${POSTGRES_PASSWORD:-postgres}"

# Keycloak parameters with default values
KEYCLOAK_URL="${KEYCLOAK_URL:-keycloak}"
KEYCLOAK_PORT="${KEYCLOAK_PORT:-8080}"
KEYCLOAK_REALM="${KEYCLOAK_REALM:-sunbird}"
KEYCLOAK_ADMIN_USERNAME="${KEYCLOAK_ADMIN_USERNAME:-admin}"
KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin}"

# Configmap namespace
NAMESPACE="${NAMESPACE:-default}"

# Query for 'kid'
QUERY_KID="SELECT value FROM component_config CC INNER JOIN component C ON (CC.component_id = C.id) WHERE C.realm_id = 'sunbird' AND provider_id = 'hmac-generated' AND CC.name = 'kid';"

# Query for 'secret'
QUERY_SECRET="SELECT value FROM component_config CC INNER JOIN component C ON (CC.component_id = C.id) WHERE C.realm_id = 'sunbird' AND provider_id = 'hmac-generated' AND CC.name = 'secret';"

# Query for lms user id
QUERY_LMS_USER="SELECT id FROM user_entity WHERE realm_id = 'sunbird' AND username = 'service-account-lms';"

# Function to execute query
execute_query() {
    psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$POSTGRES_DB" -U "$POSTGRES_USER" -t -A -c "$1"
}

# Function to check if PostgreSQL is reachable
wait_for_postgresql() {
    until psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -c '\q' 2>/dev/null; do
        echo "Waiting for PostgreSQL to become reachable..."
        sleep 5
    done
    echo "PostgreSQL is now reachable."
}

# Function to check if Keycloak is reachable
wait_for_keycloak() {
    until curl -s -f "http://$KEYCLOAK_URL:$KEYCLOAK_PORT" 2>/dev/null; do
        echo "Waiting for Keycloak to become reachable..."
        sleep 5
    done
    echo "Keycloak is now reachable."
}

# Wait for PostgreSQL
wait_for_postgresql

# Wait for Keycloak
wait_for_keycloak

# Execute the queries and capture results
REFRESH_TOKEN_KID=$(execute_query "$QUERY_KID")
REFRESH_TOKEN_SECRET=$(execute_query "$QUERY_SECRET")
LMS_USER_ID=$(execute_query "$QUERY_LMS_USER")

# Print the results
echo "Refresh token kid:"
echo "$REFRESH_TOKEN_KID"

echo "Refresh token secret:"
echo "$REFRESH_TOKEN_SECRET"

# Invoke the first URL and get the KEYCLOAK_PUBLIC_KEY
KEYCLOAK_PUBLIC_KEY=$(curl -s http://$KEYCLOAK_URL:$KEYCLOAK_PORT/auth/realms/$KEYCLOAK_REALM | jq -r '.public_key')

# Print the KEYCLOAK_PUBLIC_KEY
echo "Keycloak Public Key from URL:"
echo "$KEYCLOAK_PUBLIC_KEY"

# Invoke the second URL and get the kid
KEYCLOAK_PUBLIC_KEY_KID=$(curl -s http://$KEYCLOAK_URL:$KEYCLOAK_PORT/auth/realms/$KEYCLOAK_REALM/protocol/openid-connect/certs | jq -r '.keys[0].kid')

# Print the kid
echo "Keycloak Kid from URL:"
echo "$KEYCLOAK_PUBLIC_KEY_KID"

KEYCLOAK_PUBLIC_KEY_PEM=$(echo $KEYCLOAK_PUBLIC_KEY | sed -e "s/.\{64\}/&\\\n/g" | sed "s/^/-----BEGIN PUBLIC KEY-----\\\n/" | sed "s/$/\\\n-----END PUBLIC KEY-----/")

# Print the KEYCLOAK_PUBLIC_KEY in PEM format
echo "Keycloak Public Key in PEM format:"
echo "$KEYCLOAK_PUBLIC_KEY_PEM"

# Create Kubernetes ConfigMap with the obtained values
#kubectl delete configmap keycloak-kids-keys -n $NAMESPACE
#kubectl delete configmap keycloak-key -n $NAMESPACE
kubectl create configmap keycloak-kids-keys -n $NAMESPACE \
  --from-literal=REFRESH_TOKEN_KID="$REFRESH_TOKEN_KID" \
  --from-literal=REFRESH_TOKEN_SECRET="$REFRESH_TOKEN_SECRET" \
  --from-literal=KEYCLOAK_PUBLIC_KEY="$KEYCLOAK_PUBLIC_KEY" \
  --from-literal=KEYCLOAK_PUBLIC_KEY_PEM="$KEYCLOAK_PUBLIC_KEY_PEM" \
  --from-literal=KEYCLOAK_PUBLIC_KEY_KID="$KEYCLOAK_PUBLIC_KEY_KID" -o yaml --dry-run=client > keycloak-kids-keys.yaml 
kubectl apply -f keycloak-kids-keys.yaml 
kubectl create configmap keycloak-key -n $NAMESPACE \
  --from-literal=$KEYCLOAK_PUBLIC_KEY_KID="$KEYCLOAK_PUBLIC_KEY" -o yaml --dry-run=client > keycloak-key.yaml 
kubectl apply -f keycloak-key.yaml

# Assign service account role to lms client
echo "Generate access token"
ACCESS_TOKEN=$(curl -sS --location "$KEYCLOAK_URL:$KEYCLOAK_PORT/auth/realms/master/protocol/openid-connect/token" --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'client_id=admin-cli' --data-urlencode 'grant_type=password' --data-urlencode "username=$KEYCLOAK_ADMIN_USERNAME" --data-urlencode "password=$KEYCLOAK_ADMIN_PASSWORD" | jq -r .access_token)
echo $ACCESS_TOKEN

echo "Assign service account role"
http_status=$(curl -sS --location "http://$KEYCLOAK_URL:$KEYCLOAK_PORT/auth/admin/realms/$KEYCLOAK_REALM/users/$LMS_USER_ID/role-mappings/clients/f1e29715-91d7-4f2a-b11f-c10786f737e5" \
--header 'Accept: application/json' \
--header "Authorization: Bearer $ACCESS_TOKEN" \
--header 'Content-Type: application/json' \
--data '[
    {
        "id": "058715c3-bda2-42f8-b217-d3c8ad10875b",
        "name": "manage-users",
        "description": "${role_manage-users}",
        "composite": true,
        "clientRole": true,
        "containerId": "f1e29715-91d7-4f2a-b11f-c10786f737e5"
    }
]' -o /dev/null -w "%{http_code}")
echo "HTTP Status Code: $http_status"
