#!/bin/bash

# Admin Module DevOps Setup Script
# This script sets up the complete DevOps infrastructure for the admin module

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up DevOps infrastructure for Admin Module${NC}"

# Check if we're in the right directory
if [ ! -d "espace-admin" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p espace-admin/docker
mkdir -p scripts

# Check if files exist and create backups
backup_if_exists() {
    if [ -f "$1" ]; then
        cp "$1" "$1.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${YELLOW}📋 Backed up existing $1${NC}"
    fi
}

echo -e "${YELLOW}🔧 Setting up Docker configuration...${NC}"
backup_if_exists "espace-admin/docker/Dockerfile"
backup_if_exists "espace-admin/docker/docker-compose.yml"

echo -e "${YELLOW}⚙️ Setting up Kubernetes manifests...${NC}"
backup_if_exists "k8s/admin-deployment.yaml"
backup_if_exists "k8s/admin-service.yaml"
backup_if_exists "k8s/admin-ingress.yaml"
backup_if_exists "k8s/admin-configmap.yaml"
backup_if_exists "k8s/admin-secrets.yaml"

echo -e "${YELLOW}🔄 Setting up CI/CD workflows...${NC}"
backup_if_exists ".github/workflows/ci-admin.yml"
backup_if_exists ".github/workflows/cd-admin.yml"

echo -e "${YELLOW}📜 Setting up scripts...${NC}"
backup_if_exists "scripts/deploy-admin.sh"

echo -e "${YELLOW}🔐 Setting up environment configuration...${NC}"
backup_if_exists "espace-admin/.env.admin"

echo -e "${GREEN}✅ DevOps setup completed!${NC}"
echo -e "${BLUE}📖 Next steps:${NC}"
echo "1. Review and configure the created files"
echo "2. Set up GitHub Secrets for CI/CD"
echo "3. Configure Kubernetes secrets"
echo "4. Test the setup with a local deployment"
echo "5. Push to trigger CI/CD pipeline"
echo ""
echo -e "${BLUE}📚 Documentation: espace-admin/DEVOPS_README.md${NC}"