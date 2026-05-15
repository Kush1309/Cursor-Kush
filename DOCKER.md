# Docker Deployment Guide 🐳

Complete Docker setup with all features: multi-stage builds, health checks, volumes, resource limits, and more!

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env and add your GROQ_API_KEY
nano .env

# 3. Start with Docker Compose
docker-compose up -d

# 4. View logs
docker-compose logs -f

# 5. Open browser
http://localhost:3001
```

### Option 2: Docker CLI

```bash
# Build image
docker build -t ai-agent-builder .

# Run container
docker run -d \
  --name ai-agent-builder \
  -p 3001:3001 \
  -e GROQ_API_KEY=your_key_here \
  --restart unless-stopped \
  ai-agent-builder
```

---

## 🎯 Docker Features Implemented

### ✅ Multi-Stage Build
- **Builder stage**: Installs dependencies
- **Production stage**: Minimal runtime image
- **Result**: Smaller image size (~150MB vs 1GB+)

### ✅ Security Features
- Non-root user (nodejs:1001)
- Read-only filesystem where possible
- Minimal base image (Alpine Linux)
- No unnecessary packages

### ✅ Health Checks
- Automatic health monitoring
- Endpoint: `/health`
- Interval: 30 seconds
- Retries: 3 times
- Auto-restart on failure

### ✅ Resource Management
- CPU limit: 1 core
- Memory limit: 512MB
- CPU reservation: 0.5 core
- Memory reservation: 256MB

### ✅ Persistent Storage
- Named volume: `ai-agent-data`
- Logs directory: `./logs`
- Survives container restarts

### ✅ Logging
- JSON file driver
- Max size: 10MB per file
- Max files: 3 (rotation)
- Easy log management

### ✅ Networking
- Custom bridge network
- Isolated from other containers
- Easy service discovery

### ✅ Signal Handling
- dumb-init for proper PID 1
- Graceful shutdown
- Proper signal forwarding

---

## 📋 Docker Commands

### Build & Run

```bash
# Build image
docker build -t ai-agent-builder .

# Build with no cache
docker build --no-cache -t ai-agent-builder .

# Run container
docker run -d \
  --name ai-agent \
  -p 3001:3001 \
  -e GROQ_API_KEY=your_key \
  ai-agent-builder

# Run with volume
docker run -d \
  --name ai-agent \
  -p 3001:3001 \
  -e GROQ_API_KEY=your_key \
  -v ai-agent-data:/app/data \
  ai-agent-builder
```

### Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild and start
docker-compose up -d --build

# Stop and remove volumes
docker-compose down -v
```

### Container Management

```bash
# List containers
docker ps

# View logs
docker logs ai-agent-builder
docker logs -f ai-agent-builder  # Follow logs

# Execute command in container
docker exec -it ai-agent-builder sh

# Inspect container
docker inspect ai-agent-builder

# View stats
docker stats ai-agent-builder

# Check health
docker inspect --format='{{.State.Health.Status}}' ai-agent-builder
```

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi ai-agent-builder

# Prune unused images
docker image prune

# View image history
docker history ai-agent-builder

# Tag image
docker tag ai-agent-builder:latest ai-agent-builder:v1.0
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect ai-agent-data

# Remove volume
docker volume rm ai-agent-data

# Backup volume
docker run --rm \
  -v ai-agent-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz /data
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Required
GROQ_API_KEY=your_groq_api_key

# Optional
PORT=3001
NODE_ENV=production
LOG_LEVEL=info
```

### Port Mapping

```yaml
# Default
ports:
  - "3001:3001"

# Custom port
ports:
  - "8080:3001"
```

### Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '2'        # Max 2 CPU cores
      memory: 1G       # Max 1GB RAM
    reservations:
      cpus: '1'        # Reserve 1 core
      memory: 512M     # Reserve 512MB
```

---

## 📊 Monitoring

### Health Check

```bash
# Check health status
curl http://localhost:3001/health

# Response
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### Container Stats

```bash
# Real-time stats
docker stats ai-agent-builder

# Output
CONTAINER ID   NAME              CPU %   MEM USAGE / LIMIT   MEM %
abc123         ai-agent-builder  5.2%    128MB / 512MB      25%
```

### Logs

```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs ai-agent
```

---

## 🚀 Production Deployment

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml ai-agent

# List services
docker service ls

# Scale service
docker service scale ai-agent_ai-agent=3

# Remove stack
docker stack rm ai-agent
```

### Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-agent-builder
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-agent
  template:
    metadata:
      labels:
        app: ai-agent
    spec:
      containers:
      - name: ai-agent
        image: ai-agent-builder:latest
        ports:
        - containerPort: 3001
        env:
        - name: GROQ_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-agent-secrets
              key: groq-api-key
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
          requests:
            cpu: "0.5"
            memory: "256Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 30
```

### Docker Registry

```bash
# Tag for registry
docker tag ai-agent-builder:latest registry.example.com/ai-agent-builder:latest

# Push to registry
docker push registry.example.com/ai-agent-builder:latest

# Pull from registry
docker pull registry.example.com/ai-agent-builder:latest
```

---

## 🔒 Security Best Practices

### ✅ Implemented
- Non-root user
- Minimal base image (Alpine)
- Multi-stage build
- No secrets in image
- Health checks
- Resource limits

### 🔐 Additional Recommendations

```bash
# Scan for vulnerabilities
docker scan ai-agent-builder

# Use secrets (Docker Swarm)
echo "your_api_key" | docker secret create groq_api_key -

# Use secrets (Docker Compose)
docker-compose --env-file .env.production up -d

# Enable content trust
export DOCKER_CONTENT_TRUST=1
```

---

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker logs ai-agent-builder

# Check if port is in use
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Linux/Mac

# Inspect container
docker inspect ai-agent-builder
```

### Health check failing

```bash
# Test health endpoint
curl http://localhost:3001/health

# Check container health
docker inspect --format='{{json .State.Health}}' ai-agent-builder

# View health logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' ai-agent-builder
```

### Out of memory

```bash
# Increase memory limit
docker-compose down
# Edit docker-compose.yml: memory: 1G
docker-compose up -d

# Check memory usage
docker stats ai-agent-builder
```

### Permission issues

```bash
# Fix volume permissions
docker exec -it ai-agent-builder chown -R nodejs:nodejs /app/data

# Run as root (temporary)
docker exec -it --user root ai-agent-builder sh
```

---

## 📦 Image Size Optimization

Current optimizations:
- ✅ Multi-stage build
- ✅ Alpine base image
- ✅ Production dependencies only
- ✅ .dockerignore file

**Result**: ~150MB (vs 1GB+ without optimization)

---

## 🎉 You're Ready!

```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Open app
http://localhost:3001
```

Happy Dockerizing! 🐳✨
