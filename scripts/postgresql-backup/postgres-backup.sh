#!/bin/bash
set -euo pipefail
backup_dir="/tmp/var/backups"
backup_date=$(date +%d-%b-%Y-%s)
mkdir -p $backup_dir/$backup_date
PG_HOST=$1
PG_USER=$2
PGPASSWORD=$3

# Dump all
echo "Backup up all databases into $backup_dir/fulldb-$backup_date.sql"
PGPASSWORD=$PGPASSWORD pg_dumpall -U $PG_USER -h $PG_HOST > $backup_dir/fulldb-$backup_date.sql
bzip2 $backup_dir/fulldb-$backup_date.sql

if [ "$CLOUD_SERVICE" == "azure" ]; then
    # Use az cli to upload the file
    az storage blob upload --account-name ${AZURE_STORAGE_ACCOUNT} \
                          --account-key ${AZURE_KEY} \
                          --container-name ${AZURE_CONTAINER} \
                          --name fulldb-$backup_date.sql.bz2 \
                          --type block \
                          --file "$backup_dir/fulldb-$backup_date.sql.bz2"
fi