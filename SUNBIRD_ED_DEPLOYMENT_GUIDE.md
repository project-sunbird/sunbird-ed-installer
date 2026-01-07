# Sunbird-ED Deployment Guide: End-to-End Knowledge Transfer

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Repository Structure](#repository-structure)
5. [Configuration Management](#configuration-management)
6. [Deployment Process](#deployment-process)
7. [Building Blocks Deep Dive](#building-blocks-deep-dive)
8. [Troubleshooting](#troubleshooting)
9. [Post-Deployment Operations](#post-deployment-operations)

---

## Overview

Sunbird-ED is a comprehensive education platform that deploys on Kubernetes using a modular architecture. This guide focuses on **Azure deployment** and explains the complete flow from infrastructure provisioning to application deployment.

### Key Components
- **Cloud Provider**: Azure (AKS - Azure Kubernetes Service)
- **Infrastructure**: Terraform + Terragrunt
- **Application Deployment**: Helm Charts
- **Orchestration**: Kubernetes
- **Monitoring**: Prometheus, Grafana, Loki

---

## Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Terraform     │───▶│   Azure AKS     │───▶│   Helm Charts   │
│   (Infra)       │    │   (K8s Cluster) │    │   (Applications)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Building Blocks (Microservices Architecture)
- **edbb**: Core education services (nginx, kong, player, nodebb)
- **learnbb**: Learning management (LMS, user management, certificates)
- **knowledgebb**: Content management (content, search, taxonomy)
- **inquirybb**: Assessment and analytics with Flink jobs
- **obsrvbb**: Observability (analytics, telemetry, superset)
- **monitoring**: Infrastructure monitoring stack

---

## Prerequisites

### System Requirements
- **Minimum Resources**: 48 vCPUs, 192 GB RAM
- **Operating System**: Linux/MacOS/Windows (with GitBash)

### Required Tools
Install these tools before starting:

```bash
# Core tools
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash  # Azure CLI
wget -qO- https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip  # Terraform
curl -s https://raw.githubusercontent.com/gruntwork-io/terragrunt/master/bootstrap_terragrunt_ubuntu.sh | bash  # Terragrunt

# Kubernetes tools
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"  # kubectl
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash  # Helm

# Utility tools
sudo apt-get install jq yq rclone python3 python3-pip  # Linux utilities
pip3 install PyJWT  # Python JWT library
npm install -g @postman/newman  # Postman CLI
```

### Required Credentials
1. **Domain Name** with DNS management access
2. **SSL Certificate** (private key + certificate chain)
3. **Google OAuth Credentials** ([Setup Guide](https://developers.google.com/workspace/guides/create-credentials#oauth-client-id))
4. **Google reCAPTCHA v3** ([Setup Guide](https://www.google.com/recaptcha/admin))
5. **Email Service Provider** (SendGrid recommended)
6. **Azure Subscription** with appropriate permissions

---

## Repository Structure

### Root Directory Layout
```
sunbird-ed-installer/
├── terraform/                    # Infrastructure as Code
│   ├── azure/                   # Azure-specific configurations
│   │   ├── _common/            # Shared Terraform modules
│   │   ├── modules/            # Reusable Terraform modules
│   │   └── template/           # Template for new environments
│   └── gcp/                    # GCP configurations (not covered)
├── helmcharts/                  # Kubernetes application deployments
│   ├── edbb/                   # Core education building block
│   ├── learnbb/                # Learning management building block
│   ├── knowledgebb/            # Content management building block
│   ├── inquirybb/              # Assessment building block
│   ├── obsrvbb/                # Observability building block
│   ├── monitoring/             # Infrastructure monitoring
│   ├── additional/             # Additional services
│   ├── library/                # Shared Helm libraries
│   ├── global-resources.yaml   # Resource limits for all services
│   └── images.yaml             # Container image versions
├── scripts/                     # Utility scripts and configurations
├── postman-collection/          # API testing collections
└── README.md                   # Main documentation
```

### Key Configuration Files
- `terraform/azure/template/global-values.yaml` - Main configuration file
- `helmcharts/global-resources.yaml` - Resource allocation settings
- `helmcharts/images.yaml` - Container image versions
- `terraform/azure/template/install.sh` - Main deployment script

---

## Configuration Management

### Step 1: Environment Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/project-sunbird/sunbird-ed-installer.git
   cd sunbird-ed-installer
   ```

2. **Create Environment Directory**
   ```bash
   cd terraform/azure
   cp -r template demo  # Replace 'demo' with your environment name
   cd demo
   ```

### Step 2: Configure global-values.yaml

Edit `terraform/azure/demo/global-values.yaml`:

```yaml
global:
  building_block: "sunbird-ed"
  env: "demo" 
  environment: "demo"  # lowercase alphanumeric, 1-9 characters
  domain: "your-domain.com"
  subscription_id: "your-azure-subscription-id"
  
  # SSL Configuration
  proxy_private_key: |
    -----BEGIN PRIVATE KEY-----
    [Your SSL private key content]
    -----END PRIVATE KEY-----
  proxy_certificate: |
    -----BEGIN CERTIFICATE-----
    [Your SSL certificate content]
    -----END CERTIFICATE-----
  
  # Google Services
  sunbird_google_captcha_site_key: "your-recaptcha-site-key"
  google_captcha_private_key: "your-recaptcha-private-key"
  sunbird_google_oauth_clientId: "your-google-oauth-client-id"
  sunbird_google_oauth_clientSecret: "your-google-oauth-client-secret"
  
  # Email Configuration
  mail_server_from_email: "noreply@your-domain.com"
  mail_server_password: "your-sendgrid-api-key"
  mail_server_host: "smtp.sendgrid.net"
  mail_server_port: "587"
  mail_server_username: "apikey"
  
  # Optional Services
  sunbird_msg_91_auth: ""  # SMS service (optional)
  youtube_apikey: ""       # YouTube integration (optional)
  
  # Feature Flags
  deploy_dial_services: "false"  # Set to "true" if DIAL services needed
  lets_encrypt_ssl: false        # Set to "true" for Let's Encrypt
```

### Step 3: Azure Authentication

```bash
# Login to Azure
az login --tenant YOUR_AZURE_TENANT_ID

# Verify subscription
az account show
```

---

## Deployment Process

### Phase 1: Infrastructure Deployment

The deployment process is orchestrated by `terraform/azure/demo/install.sh`:

#### 1. Terraform Backend Creation
```bash
# Creates Azure Storage Account for Terraform state
./install.sh create_tf_backend
```

**What happens:**
- Creates resource group for Terraform state
- Sets up Azure Storage Account
- Configures blob container for state files
- **Files involved:** `create_tf_backend.sh`

#### 2. Infrastructure Provisioning
```bash
# Provisions all Azure resources
./install.sh create_tf_resources
```

**What happens:**
- **Network Module** (`network/terragrunt.hcl`): Creates VNet, subnets, NSGs
- **AKS Module** (`aks/terragrunt.hcl`): Provisions Kubernetes cluster
- **Storage Module** (`storage/terragrunt.hcl`): Creates storage accounts, containers
- **Keys Module** (`keys/terragrunt.hcl`): Generates SSH keys and secrets
- **Output Module** (`output-file/terragrunt.hcl`): Generates kubeconfig

**Resources Created:**
- Azure Kubernetes Service (AKS) cluster
- Virtual Network with subnets
- Storage accounts for application data
- Load balancers and public IPs
- Network security groups
- Azure Container Registry (if enabled)

### Phase 2: Application Deployment

#### 1. Helm Chart Installation
The system deploys building blocks in this order:

```bash
components=("monitoring" "edbb" "learnbb" "knowledgebb" "obsrvbb" "inquirybb" "additional")
```

**Deployment Command for Each Component:**
```bash
helm upgrade --install "$component" "$component" \
  --namespace sunbird \
  -f "$component/values.yaml" \
  -f "$component/ed-values.yaml" \
  -f "images.yaml" \
  -f "global-resources.yaml" \
  -f "../terraform/azure/demo/global-values.yaml" \
  --timeout 30m
```

#### 2. Component-Specific Deployments

**Monitoring Stack** (`helmcharts/monitoring/`)
- Prometheus for metrics collection
- Grafana for visualization
- Loki for log aggregation
- AlertManager for notifications

**EDBB - Core Services** (`helmcharts/edbb/`)
- **nginx-public-ingress**: External load balancer
- **nginx-private-ingress**: Internal routing
- **kong**: API gateway
- **player**: Content player service
- **nodebb**: Discussion forum
- **bot**: Chatbot service
- **echo**: Echo service for testing

**LearnBB - Learning Management** (`helmcharts/learnbb/`)
- **lms**: Learning Management System
- **userorg**: User and organization management
- **groups**: Group management
- **notification**: Notification service
- **cert**: Certificate generation
- **registry**: Registry service
- **adminutils**: Administrative utilities

**KnowledgeBB - Content Management** (`helmcharts/knowledgebb/`)
- **content**: Content service
- **learning**: Learning service
- **search**: Search functionality
- **taxonomy**: Content taxonomy
- **dial**: DIAL code services (optional)

**InquiryBB - Assessment** (`helmcharts/inquirybb/`)
- **assessment**: Assessment service
- **flink**: Stream processing jobs

**ObsrvBB - Observability** (`helmcharts/obsrvbb/`)
- **analytics**: Analytics service
- **telemetry**: Telemetry collection
- **superset**: Data visualization

### Phase 3: Post-Deployment Configuration

#### 1. Certificate Configuration
```bash
# Generates RSA keys for certificate signing
./install.sh certificate_config
```

#### 2. NodeBB Plugin Activation
```bash
# Activates forum plugins
kubectl exec -n sunbird deploy/nodebb -- ./nodebb activate nodebb-plugin-create-forum
kubectl exec -n sunbird deploy/nodebb -- ./nodebb activate nodebb-plugin-sunbird-oidc
kubectl exec -n sunbird deploy/nodebb -- ./nodebb build
```

#### 3. DNS Configuration
```bash
# Waits for DNS propagation
./install.sh dns_mapping
```

#### 4. API Configuration
```bash
# Runs Postman collections to configure APIs
./install.sh run_post_install
./install.sh create_client_forms
```

---

## Building Blocks Deep Dive

### Helm Chart Structure

Each building block follows this structure:
```
helmcharts/[building-block]/
├── charts/                    # Dependency charts (.tgz files)
├── templates/                 # Kubernetes manifests
├── Chart.yaml                # Chart metadata and dependencies
├── values.yaml               # Default configuration values
├── ed-values.yaml            # Education-specific overrides
└── Chart.lock                # Dependency lock file
```

### Dependency Management

**Automatic Dependency Resolution:**
```yaml
# Example from helmcharts/obsrvbb/Chart.yaml
dependencies:
  - name: kafka
    repository: https://charts.bitnami.com/bitnami
    version: 20.0.2
    condition: kafka.enabled
  - name: redis
    repository: https://charts.bitnami.com/bitnami
    version: 18.1.1
    condition: redis.enabled
```

**How Dependencies Work:**
1. `helm dependency update` downloads charts from repositories
2. Charts are packaged as `.tgz` files in `charts/` directory
3. `Chart.lock` locks specific versions
4. Conditions control which dependencies are deployed

### Resource Management

**Global Resource Configuration** (`helmcharts/global-resources.yaml`):
```yaml
# Example resource allocation
lms:
  resources:
    requests:
      cpu: 100m
      memory: 100Mi
    limits:
      cpu: 1
      memory: 1536Mi

kafka:
  broker:
    resources:
      requests:
        cpu: 750m
        memory: 1024Mi
      limits:
        cpu: 1
        memory: 2048Mi
    persistence:
      size: 8Gi
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Pod Startup Issues
```bash
# Check pod status
kubectl get pods -n sunbird

# Check specific pod logs
kubectl logs -n sunbird deployment/[service-name]

# Describe pod for events
kubectl describe pod -n sunbird [pod-name]
```

#### 2. DNS Resolution Issues
```bash
# Check DNS mapping
nslookup your-domain.com

# Get load balancer IP
kubectl get svc -n sunbird nginx-public-ingress
```

#### 3. Certificate Issues
```bash
# Check certificate configmap
kubectl get configmap -n sunbird nginx-public-ingress -o yaml

# Regenerate certificates
./install.sh certificate_config
```

#### 4. Database Connection Issues
```bash
# Check database pods
kubectl get pods -n sunbird | grep -E "(postgres|cassandra|redis)"

# Check database logs
kubectl logs -n sunbird deployment/postgresql
```

### Debugging Commands

```bash
# Check all resources in sunbird namespace
kubectl get all -n sunbird

# Check persistent volumes
kubectl get pv,pvc -n sunbird

# Check ingress configuration
kubectl get ingress -n sunbird

# Check configmaps and secrets
kubectl get configmaps,secrets -n sunbird
```

---

## Post-Deployment Operations

### Default Users
After successful deployment, these users are available:

| Role              | Email                      | Password         |
|-------------------|----------------------------|------------------|
| Admin             | admin@yopmail.com          | Admin@123        |
| Content Creator   | contentcreator@yopmail.com | Creator@123      |
| Content Reviewer  | contentreviewer@yopmail.com| Reviewer@123     |
| Book Creator      | bookcreator@yopmail.com    | Bookcreator@123  |
| Book Reviewer     | bookreviewer@yopmail.com   | BookReviewer@123 |
| Public User 1     | user1@yopmail.com          | User1@123        |
| Public User 2     | user2@yopmail.com          | User2@123        |

### Accessing Services

1. **Main Portal**: `https://your-domain.com`
2. **Grafana**: `https://your-domain.com/grafana` (admin/prom-operator)
3. **Superset**: `https://your-domain.com/superset` (admin/admin)

### Backup and Maintenance

#### SSL Certificate Renewal (Let's Encrypt)
If using Let's Encrypt (`lets_encrypt_ssl: true`):
- Automatic renewal every 85 days via CronJob
- Update `global-values.yaml` with renewed certificates
- Restart affected services

#### Database Backups
```bash
# PostgreSQL backup
kubectl exec -n sunbird deployment/postgresql -- pg_dump -U postgres [database_name] > backup.sql

# Cassandra backup
kubectl exec -n sunbird deployment/cassandra -- nodetool snapshot
```

### Scaling Operations

#### Horizontal Pod Autoscaling
```bash
# Enable HPA for a service
kubectl autoscale deployment lms -n sunbird --cpu-percent=70 --min=2 --max=10
```

#### Manual Scaling
```bash
# Scale a deployment
kubectl scale deployment lms -n sunbird --replicas=3
```

### Monitoring and Observability

#### Key Metrics to Monitor
- **Pod Health**: CPU, Memory, Restart counts
- **Database Performance**: Connection pools, query performance
- **API Response Times**: Through Kong metrics
- **Storage Usage**: PVC utilization
- **Network Traffic**: Ingress/Egress patterns

#### Log Analysis
```bash
# View aggregated logs in Grafana
# Access: https://your-domain.com/grafana
# Navigate to Explore > Loki

# Direct log access
kubectl logs -f -n sunbird deployment/[service-name]
```

### Cleanup and Destruction

#### Complete Environment Cleanup
```bash
cd terraform/azure/demo
./install.sh destroy_tf_resources
```

**What gets destroyed:**
- All Kubernetes resources
- AKS cluster
- Storage accounts
- Network resources
- Resource groups

---

## Best Practices

### Security
1. **Rotate passwords** regularly using Kubernetes secrets
2. **Use RBAC** for service account permissions
3. **Enable network policies** for pod-to-pod communication
4. **Regular security updates** for container images

### Performance
1. **Monitor resource usage** and adjust limits accordingly
2. **Use persistent volumes** for stateful services
3. **Implement caching** strategies for frequently accessed data
4. **Optimize database queries** and indexes

### Maintenance
1. **Regular backups** of databases and configurations
2. **Test disaster recovery** procedures
3. **Keep documentation updated** with environment changes
4. **Monitor certificate expiration** dates

---

This guide provides a comprehensive understanding of the Sunbird-ED deployment process. For specific issues or advanced configurations, refer to the individual component documentation in their respective directories.