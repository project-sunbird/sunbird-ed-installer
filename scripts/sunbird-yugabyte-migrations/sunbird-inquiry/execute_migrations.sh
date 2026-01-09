#!/bin/bash

#####################################################
# YugabyteDB CQL Migration Script
# Executes all CQL files in the sunbird-inquiry folder
#####################################################

# Usage function
usage() {
    echo "Usage: $0 [ENVIRONMENT]"
    echo "  ENVIRONMENT: Environment prefix for CQL files (e.g., dev, sb, prod)"
    echo "               Default: dev"
    echo ""
    echo "Examples:"
    echo "  $0           # Uses 'dev' as environment"
    echo "  $0 dev       # Uses 'dev' as environment"
    echo "  $0 sb        # Uses 'sb' as environment"
    echo "  $0 prod      # Uses 'prod' as environment"
    exit 1
}

# Get environment from parameter or use default
ENVIRONMENT="${1:-dev}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Log file
LOG_FILE="${SCRIPT_DIR}/migration_$(date +%Y%m%d_%H%M%S).log"

# YugabyteDB connection parameters (can be overridden by environment variables)
YCQLSH_HOST="${YCQLSH_HOST:-localhost}"
YCQLSH_PORT="${YCQLSH_PORT:-9042}"
YCQLSH_USERNAME="${YCQLSH_USERNAME:-yugabyte}"
YCQLSH_PASSWORD="${YCQLSH_PASSWORD:-yugabyte}"

# Counter variables
TOTAL_FILES=0
SUCCESSFUL_FILES=0
FAILED_FILES=0

# Array to store failed files
declare -a FAILED_FILE_LIST

#####################################################
# Function: Print colored message
#####################################################
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ${message}" >> "${LOG_FILE}"
}

#####################################################
# Function: Print header
#####################################################
print_header() {
    echo ""
    print_message "${BLUE}" "=============================================="
    print_message "${BLUE}" "$1"
    print_message "${BLUE}" "=============================================="
    echo ""
}

#####################################################
# Function: Execute CQL file
#####################################################
execute_cql_file() {
    local cql_file=$1
    local filename=$(basename "${cql_file}")
    
    print_message "${YELLOW}" "Processing: ${filename}"
    
    # Create temp file and replace ${ENV} with actual environment
    local temp_file="${SCRIPT_DIR}/.tmp_${filename}"
    sed "s/\${ENV}/${ENVIRONMENT}/g" "${cql_file}" > "${temp_file}"
    
    # Execute the CQL file using ycqlsh
    set +e  # Disable exit on error for this command
    ycqlsh "${YCQLSH_HOST}" "${YCQLSH_PORT}" \
        -u "${YCQLSH_USERNAME}" \
        -p "${YCQLSH_PASSWORD}" \
        -f "${temp_file}" >> "${LOG_FILE}" 2>&1
    local exit_code=$?
    set -e  # Re-enable exit on error
    
    # Clean up temp file
    rm -f "${temp_file}"
    
    if [ $exit_code -eq 0 ]; then
        print_message "${GREEN}" "✓ SUCCESS: ${filename} executed successfully"
        SUCCESSFUL_FILES=$((SUCCESSFUL_FILES + 1))
    else
        print_message "${RED}" "✗ FAILED: ${filename} execution failed (exit code: $exit_code)"
        FAILED_FILE_LIST+=("${filename}")
        FAILED_FILES=$((FAILED_FILES + 1))
    fi
    
    echo ""
}

#####################################################
# Main Script
#####################################################

print_header "YugabyteDB CQL Migration Script - sunbird-inquiry"

print_message "${BLUE}" "Configuration:"
echo "  Environment: ${ENVIRONMENT}"
echo "  Host: ${YCQLSH_HOST}"
echo "  Port: ${YCQLSH_PORT}"
echo "  Username: ${YCQLSH_USERNAME}"
echo "  Script Directory: ${SCRIPT_DIR}"
echo "  Log File: ${LOG_FILE}"
echo ""

# Check if ycqlsh is available
if ! command -v ycqlsh &> /dev/null; then
    print_message "${RED}" "ERROR: ycqlsh command not found. Please ensure YugabyteDB client is installed."
    exit 1
fi

# Test connection to YugabyteDB
print_message "${YELLOW}" "Testing connection to YugabyteDB..."
if ycqlsh "${YCQLSH_HOST}" "${YCQLSH_PORT}" \
    -u "${YCQLSH_USERNAME}" \
    -p "${YCQLSH_PASSWORD}" \
    -e "DESCRIBE KEYSPACES;" >> "${LOG_FILE}" 2>&1; then
    print_message "${GREEN}" "✓ Connection successful"
    echo ""
else
    print_message "${RED}" "✗ Connection failed. Please check your connection parameters."
    exit 1
fi

# Define the order of execution for CQL files
CQL_FILES=(
    "hierarchy_store.cql"
    "question_store.cql"
)

print_header "Starting CQL File Execution"

# Execute each CQL file in order
for cql_file in "${CQL_FILES[@]}"; do
    full_path="${SCRIPT_DIR}/${cql_file}"
    
    if [ -f "${full_path}" ]; then
        TOTAL_FILES=$((TOTAL_FILES + 1))
        execute_cql_file "${full_path}"
    else
        print_message "${YELLOW}" "WARNING: ${cql_file} not found, skipping..."
        echo ""
    fi
done

# Print summary
print_header "Migration Summary"

echo "Total Files Processed: ${TOTAL_FILES}"
echo "Successful: ${SUCCESSFUL_FILES}"
echo "Failed: ${FAILED_FILES}"
echo ""

if [ ${FAILED_FILES} -gt 0 ]; then
    print_message "${RED}" "Failed Files:"
    for failed_file in "${FAILED_FILE_LIST[@]}"; do
        echo "  - ${failed_file}"
    done
    echo ""
    print_message "${RED}" "Migration completed with errors. Check log file: ${LOG_FILE}"
    exit 1
else
    print_message "${GREEN}" "All migrations completed successfully!"
    print_message "${BLUE}" "Log file: ${LOG_FILE}"
fi

echo ""
print_message "${BLUE}" "=============================================="
