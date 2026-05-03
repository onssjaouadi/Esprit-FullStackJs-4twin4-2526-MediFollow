#!/bin/bash

# Admin Module Deployment Script
# This script deploys the admin module to the specified environment

set -e

# Configuration
ENVIRONMENT=${1:-staging}
NAMESPACE="medifollow-${ENVIRONMENT}"
APP_NAME="medifollow-admin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment of ${APP_NAME} to ${ENVIRONMENT}${NC}"

# Check if kubectl is configured
if ! kubectl cluster-info >/dev/null 2>&1; then
    echo -e "${RED}❌ kubectl is not configured or cluster is not accessible${NC}"
    exit 1
fi

# Switch to the correct namespace
echo -e "${YELLOW}📦 Switching to namespace: ${NAMESPACE}${NC}"
kubectl config set-context --current --namespace=${NAMESPACE}

# Apply ConfigMaps
echo -e "${YELLOW}📋 Applying ConfigMaps...${NC}"
kubectl apply -f k8s/admin-configmap.yaml

# Apply Secrets (you need to populate these manually or through CI/CD)
echo -e "${YELLOW}🔐 Applying Secrets...${NC}"
kubectl apply -f k8s/admin-secrets.yaml

# Apply Services
echo -e "${YELLOW}🌐 Applying Services...${NC}"
kubectl apply -f k8s/admin-service.yaml

# Apply Deployments
echo -e "${YELLOW}🐳 Applying Deployments...${NC}"
kubectl apply -f k8s/admin-deployment.yaml

# Apply Ingress
echo -e "${YELLOW}🌍 Applying Ingress...${NC}"
kubectl apply -f k8s/admin-ingress.yaml

# Wait for rollout to complete
echo -e "${YELLOW}⏳ Waiting for rollout to complete...${NC}"
kubectl rollout status deployment/${APP_NAME} --timeout=600s

# Run database migrations if needed
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
    kubectl exec -it deployment/${APP_NAME} -- npm run prisma:migrate
fi

# Health check
echo -e "${YELLOW}🏥 Running health check...${NC}"
kubectl run health-check --image=curlimages/curl --rm -i --restart=Never -- curl -f http://${APP_NAME}.${NAMESPACE}.svc.cluster.local/health

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Admin module is available at: https://admin${ENVIRONMENT:+-$ENVIRONMENT}.medifollow.com${NC}"