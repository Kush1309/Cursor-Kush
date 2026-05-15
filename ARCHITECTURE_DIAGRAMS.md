# Architecture Diagrams - Visual Reference 📊

Quick visual reference for the AI Agent Builder architecture.

---

## 1. System Overview Diagram

```
                    ┌─────────────────┐
                    │   END USERS     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   INTERNET      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  LOAD BALANCER  │
                    │   (Optional)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌────────▼────────┐   ┌──────▼──────┐
│  Container 1  │   │  Container 2    │   │Container 3  │
│  :3001        │   │  :3002          │   │ :3003       │
└───────┬───────┘   └────────┬────────┘   └──────┬──────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  SHARED STORAGE │
                    │  • Volumes      │
                    │  • Logs         │
                    │  • Data         │
                    └─────────────────┘
```

---

## 2. Request Flow Diagram

```
User Browser
     │
     │ 1. HTTP Request
     ▼
┌─────────────────┐
│  Frontend (UI)  │
│  • HTML/CSS/JS  │
└────────┬────────┘
         │
         │ 2. POST /api/sessions/:id/chat
         ▼
┌─────────────────┐
│  Express Server │
│  • Routes       │
│  • Middleware   │
└────────┬────────┘
         │
         │ 3. Process Request
         ▼
┌─────────────────┐
│   AI Agent      │
│  • Context Mgmt │
│  • Tool Handler │
└────────┬────────┘
         │
         │ 4. Stream Request
         ▼
┌─────────────────┐
│   Groq API      │
│  LLaMA 3.3 70B  │
└────────┬────────┘
         │
         │ 5. Streaming Response
         ▼
┌─────────────────┐
│  SSE Stream     │
│  • Text chunks  │
│  • Tool calls   │
└────────┬────────┘
         │
         │ 6. Real-time Update
         ▼
    User Browser
    (Live Display)
```

---

## 3. Docker Architecture

```
┌─────────────────────────────────────────────────┐
│              DOCKER HOST                        │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Docker Network: ai-agent-network         │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │  Container: ai-agent-builder        │ │ │
│  │  │                                     │ │ │
│  │  │  ┌───────────────────────────────┐ │ │ │
│  │  │  │  PID 1: dumb-init             │ │ │ │
│  │  │  │    └─ node server.js          │ │ │ │
│  │  │  └───────────────────────────────┘ │ │ │
│  │  │                                     │ │ │
│  │  │  User: nodejs (1001)                │ │ │
│  │  │  Port: 3001                         │ │ │
│  │  │  CPU: 1 core max                    │ │ │
│  │  │  RAM: 512MB max                     │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Volumes                                  │ │
│  │  • ai-agent-data (persistent)             │ │
│  │  • ./logs (bind mount)                    │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 4. Multi-Stage Build

```
┌──────────────────────────────────────┐
│  STAGE 1: BUILDER                    │
│  FROM node:20-alpine                 │
│                                      │
│  1. Copy package.json                │
│  2. npm ci --only=production         │
│  3. Optimize dependencies            │
│                                      │
│  Output: /app/node_modules           │
└──────────────┬───────────────────────┘
               │
               │ Copy optimized modules
               ▼
┌──────────────────────────────────────┐
│  STAGE 2: PRODUCTION                 │
│  FROM node:20-alpine                 │
│                                      │
│  1. Install dumb-init                │
│  2. Create nodejs user               │
│  3. Copy node_modules from builder   │
│  4. Copy application code            │
│  5. Set permissions                  │
│  6. Configure health check           │
│                                      │
│  Output: Production image (~150MB)   │
└──────────────────────────────────────┘
```

---

## 5. CI/CD Pipeline

```
┌─────────────────────────────────────────────┐
│  TRIGGER: git push / tag                    │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  1. Checkout Code                           │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  2. Setup Docker Buildx                     │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  3. Login to Registry                       │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  4. Build & Push Image                      │
│     • Multi-stage build                     │
│     • Layer caching                         │
│     • Tag: latest, version, sha             │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  5. Security Scan (Trivy)                   │
│     • Vulnerability check                   │
│     • Generate report                       │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  6. Deploy (Optional)                       │
│     • Update production                     │
│     • Notify team                           │
└─────────────────────────────────────────────┘
```

---

## 6. Scaling Architecture

```
                ┌─────────────────┐
                │ Load Balancer   │
                │  (Nginx/Cloud)  │
                └────────┬────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐
│ Instance 1    │ │ Instance 2  │ │ Instance 3  │
│ CPU: 5%       │ │ CPU: 5%     │ │ CPU: 5%     │
│ RAM: 50MB     │ │ RAM: 50MB   │ │ RAM: 50MB   │
└───────┬───────┘ └──────┬──────┘ └──────┬──────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                ┌────────▼────────┐
                │  Shared Storage │
                │  • Database     │
                │  • Cache        │
                │  • Files        │
                └─────────────────┘
```

---

## 7. Security Layers

```
┌─────────────────────────────────────────────┐
│  Layer 5: Monitoring & Auditing            │
│  • Logs • Alerts • Compliance               │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Layer 4: Secrets Management                │
│  • Env vars • Vault • Encryption            │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Layer 3: Application Security              │
│  • Input validation • XSS • CSRF            │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Layer 2: Container Security                │
│  • Non-root • Minimal image • Limits        │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  Layer 1: Network Security                  │
│  • HTTPS • CORS • Firewall • Rate limit     │
└─────────────────────────────────────────────┘
```

---

## 8. Monitoring Stack

```
┌─────────────────────────────────────────────┐
│  Application                                │
│  • Metrics • Logs • Events                  │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Docker Container                           │
│  • CPU • Memory • Network • Disk            │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Health Checks                              │
│  • Liveness • Readiness • Startup           │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Aggregation & Analysis                     │
│  • Prometheus • Grafana • ELK               │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Alerting                                   │
│  • Email • Slack • PagerDuty                │
└─────────────────────────────────────────────┘
```

---

## 9. Data Flow (Detailed)

```
┌──────────┐
│  User    │ Types: "Create calculator"
└────┬─────┘
     │
     │ 1. Frontend captures input
     ▼
┌──────────────┐
│  app.js      │ sendMessage()
└────┬─────────┘
     │
     │ 2. POST /api/sessions/:id/chat
     ▼
┌──────────────┐
│  server.js   │ Route handler
└────┬─────────┘
     │
     │ 3. Set SSE headers
     ▼
┌──────────────┐
│  AI Agent    │ runAgentStreaming()
└────┬─────────┘
     │
     │ 4. Stream to Groq
     ▼
┌──────────────┐
│  Groq API    │ LLaMA 3.3 70B
└────┬─────────┘
     │
     │ 5. Streaming chunks
     ▼
┌──────────────┐
│  Server      │ Process chunks
└────┬─────────┘
     │
     │ 6. SSE events
     ▼
┌──────────────┐
│  Frontend    │ Update UI
└────┬─────────┘
     │
     │ 7. Display to user
     ▼
┌──────────┐
│  User    │ Sees streaming response
└──────────┘
```

---

## 10. Deployment Options

```
┌─────────────────────────────────────────────┐
│  LOCAL DEVELOPMENT                          │
│  docker-compose up                          │
│  • Single machine                           │
│  • Quick testing                            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  CLOUD PLATFORMS                            │
│  • AWS (ECS, Fargate, EKS)                  │
│  • Google Cloud (Cloud Run, GKE)            │
│  • Azure (ACI, AKS)                         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  PAAS PLATFORMS                             │
│  • Heroku                                   │
│  • Railway                                  │
│  • Render                                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  KUBERNETES                                 │
│  • Deployment manifests                     │
│  • Service definitions                      │
│  • Auto-scaling                             │
└─────────────────────────────────────────────┘
```

---

**These diagrams complement the full ARCHITECTURE.md document.**

For complete details, see: [ARCHITECTURE.md](ARCHITECTURE.md)
