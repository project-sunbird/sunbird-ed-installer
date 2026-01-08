# Sunbird YugabyteDB Migrations

This repository contains CQL migration scripts for migrating Sunbird database schemas to YugabyteDB.

## Structure

```
sunbird-lern/          # Learning and user management schemas
sunbird-knowlg/        # Knowledge and content management schemas  
sunbird-inquiry/       # Assessment and inquiry schemas
```

## Usage

### Running as Kubernetes Job

In your Kubernetes job container, use the following script:

```bash
#!/bin/bash

# Set environment variables
export ENV=dev  # or sb, prod
export YCQLSH_HOST=localhost
export YCQLSH_PORT=9042
export YCQLSH_USERNAME=yugabyte
export YCQLSH_PASSWORD=yugabyte

# Navigate to the migration directory
cd /path/to/sunbird-yugabyte-migrations

# Run sunbird-lern migrations
cd sunbird-lern
./execute_migrations.sh

# Run sunbird-knowlg migrations
cd ../sunbird-knowlg
./execute_migrations.sh $ENV

# Run sunbird-inquiry migrations
cd ../sunbird-inquiry
./execute_migrations.sh $ENV
```

### Manual Execution

**1. Copy files to YugabyteDB pod:**
```bash
kubectl cp sunbird-lern/ -n <namespace> <pod-name>:/tmp/sunbird-lern/
kubectl cp sunbird-knowlg/ -n <namespace> <pod-name>:/tmp/sunbird-knowlg/
kubectl cp sunbird-inquiry/ -n <namespace> <pod-name>:/tmp/sunbird-inquiry/
```

**2. Run migrations inside the pod:**
```bash
# sunbird-lern
cd /tmp/sunbird-lern
./execute_migrations.sh

# sunbird-knowlg
cd /tmp/sunbird-knowlg
./execute_migrations.sh dev

# sunbird-inquiry
cd /tmp/sunbird-inquiry
./execute_migrations.sh dev
```

## Environment Parameters

- **sunbird-lern**: No environment parameter (uses fixed keyspace names)
- **sunbird-knowlg**: Requires environment (dev/sb/prod) - creates `{ENV}_category_store`, `{ENV}_content_store`, etc.
- **sunbird-inquiry**: Requires environment (dev/sb/prod) - creates `{ENV}_hierarchy_store`, `{ENV}_question_store`

## Connection Configuration

Override default connection settings using environment variables:
```bash
export YCQLSH_HOST=localhost
export YCQLSH_PORT=9042
export YCQLSH_USERNAME=yugabyte
export YCQLSH_PASSWORD=yugabyte
```

## Output

Each script generates:
- Colored console output showing progress
- Timestamped log file in the same directory
- Summary report of successful/failed migrations
