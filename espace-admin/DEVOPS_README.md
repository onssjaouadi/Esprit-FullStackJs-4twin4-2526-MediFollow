# Admin Module DevOps Setup

This document outlines the DevOps infrastructure for the MediFollow Admin Module, following the same patterns as the main application.

## 🏗️ Architecture Overview

The Admin Module uses the same DevOps stack as the main application:
- **CI/CD**: GitHub Actions
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Infrastructure**: Multi-environment (staging/production)
- **Monitoring**: Sentry, health checks
- **Security**: Trivy scanning, secrets management

## 📁 File Structure

```
espace-admin/
├── docker/
│   ├── Dockerfile              # Multi-stage build
│   └── docker-compose.yml      # Local development
├── .env.admin                  # Environment variables
└── ...

.github/workflows/
├── ci-admin.yml               # CI pipeline
└── cd-admin.yml               # CD pipeline

k8s/
├── admin-deployment.yaml      # Kubernetes deployment
├── admin-service.yaml         # Kubernetes service
├── admin-ingress.yaml         # Ingress configuration
├── admin-configmap.yaml       # Configuration
└── admin-secrets.yaml         # Secrets template

scripts/
└── deploy-admin.sh           # Deployment script
```

## 🚀 Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- MongoDB (local or Atlas)

### Setup
1. Copy environment file:
   ```bash
   cp .env.admin .env.local
   ```

2. Start local services:
   ```bash
   cd espace-admin
   docker-compose -f docker/docker-compose.yml up -d
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

The admin module will be available at `http://localhost:3001`

## 🔄 CI/CD Pipeline

### Continuous Integration (ci-admin.yml)
- **Trigger**: Push/PR to main/develop branches affecting `espace-admin/`
- **Jobs**:
  - Test: Linting, unit tests, build
  - Security: NPM audit, Trivy vulnerability scan

### Continuous Deployment (cd-admin.yml)
- **Trigger**: Successful CI completion
- **Jobs**:
  - Docker Build: Multi-stage build and push to GHCR
  - Deploy Staging: Auto-deploy to staging on develop branch
  - Deploy Production: Auto-deploy to production on main branch

## 🐳 Docker Configuration

### Multi-stage Build
- **Base**: Node.js 18 Alpine
- **Deps**: Install production dependencies
- **Builder**: Build application
- **Runner**: Production runtime with Next.js standalone

### Local Development
- Separate MongoDB instance (port 27018)
- Separate Redis instance (port 6380)
- Hot reload enabled
- Volume mounts for development

## ☸️ Kubernetes Deployment

### Environments
- **Staging**: `medifollow-staging` namespace
- **Production**: `medifollow-production` namespace

### Components
- **Deployment**: 3 replicas, rolling updates
- **Service**: ClusterIP for internal communication
- **Ingress**: SSL termination, rate limiting
- **ConfigMap**: Environment-specific configuration
- **Secrets**: Sensitive data (database URLs, API keys)

### Health Checks
- **Liveness**: `/api/health` endpoint
- **Readiness**: Same endpoint for load balancing

## 🔐 Secrets Management

Secrets are managed via Kubernetes secrets and should be populated through:
- GitHub Secrets (CI/CD)
- External secret management (production)
- Manual kubectl commands (development)

Required secrets:
- `database-url`: MongoDB connection string
- `nextauth-secret`: NextAuth.js secret
- `pusher-*`: Pusher real-time configuration
- `sentry-dsn`: Error tracking DSN

## 📊 Monitoring & Observability

### Health Checks
- Application health: `/api/health`
- Database connectivity: Prisma health checks
- External services: Pusher, Redis

### Error Tracking
- Sentry integration for error reporting
- Environment-specific DSN configuration

### Logging
- Container logs via kubectl
- Structured logging with Winston
- Log aggregation (ELK stack recommended)

## 🚀 Deployment Process

### Automated (CI/CD)
1. Push to main/develop → CI runs
2. CI success → CD triggers
3. Docker build & push
4. Kubernetes deployment
5. Health checks & rollbacks if needed

### Manual Deployment
```bash
# Deploy to staging
./scripts/deploy-admin.sh staging

# Deploy to production
./scripts/deploy-admin.sh production
```

## 🔧 Configuration

### Environment Variables
See `.env.admin` for all required variables.

### Database
- Separate database instance (`medifollow_admin`)
- Prisma migrations run automatically on production deploy
- Connection pooling configured

### Networking
- Staging: `admin-staging.medifollow.com`
- Production: `admin.medifollow.com`
- SSL certificates via cert-manager

## 🛡️ Security

### Container Security
- Non-root user execution
- Minimal base image (Alpine)
- No sensitive data in images

### Network Security
- Internal services not exposed externally
- Ingress with SSL/TLS
- Rate limiting on ingress

### Secret Security
- No secrets in code or Docker images
- Encrypted at rest and in transit
- Rotation procedures documented

## 📈 Scaling

### Horizontal Scaling
- Kubernetes HPA based on CPU/memory
- Multiple replicas across nodes

### Database Scaling
- MongoDB Atlas for production
- Connection pooling
- Read replicas for high availability

## 🔄 Rollback Strategy

### Automated Rollback
- Kubernetes rollout undo on health check failure
- Previous image versions retained in registry

### Manual Rollback
```bash
kubectl rollout undo deployment/medifollow-admin
```

## 📝 Maintenance

### Database Migrations
```bash
kubectl exec -it deployment/medifollow-admin -- npm run prisma:migrate
```

### Log Inspection
```bash
kubectl logs -f deployment/medifollow-admin
```

### Pod Debugging
```bash
kubectl exec -it deployment/medifollow-admin -- /bin/sh
```

## 🎯 Next Steps

1. Configure GitHub Secrets for CI/CD
2. Set up Kubernetes secrets
3. Configure DNS for admin domains
4. Set up monitoring dashboards
5. Implement backup strategies
6. Configure log aggregation

---

For questions or issues, refer to the main application DevOps documentation or contact the DevOps team.