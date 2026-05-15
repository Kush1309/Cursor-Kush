# Docker Quick Start 🐳

Get your AI Agent Builder running in Docker in 3 steps!

## 🚀 Quick Start

### Step 1: Setup Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your GROQ_API_KEY
# Windows: notepad .env
# Linux/Mac: nano .env
```

### Step 2: Start with Docker Compose

```bash
docker-compose up -d
```

### Step 3: Open Browser

```
http://localhost:3001
```

That's it! 🎉

---

## 📋 Common Commands

```bash
# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Restart
docker-compose restart

# Check status
docker-compose ps

# View health
curl http://localhost:3001/health
```

---

## 🛠️ Using Makefile (Optional)

If you have `make` installed:

```bash
make up        # Start
make down      # Stop
make logs      # View logs
make shell     # Open shell
make health    # Check health
```

---

## 🔧 Development Mode

For development with hot reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

Changes to code will automatically reload!

---

## 🐛 Troubleshooting

### Port already in use?

```bash
# Stop local server first
# Then start Docker

# Or change port in docker-compose.yml:
ports:
  - "8080:3001"  # Use port 8080 instead
```

### Container won't start?

```bash
# Check logs
docker-compose logs

# Rebuild
docker-compose up -d --build
```

### Need to reset everything?

```bash
# Stop and remove everything
docker-compose down -v

# Rebuild and start fresh
docker-compose up -d --build
```

---

## 📚 More Info

See **[DOCKER.md](DOCKER.md)** for complete documentation with all features!

---

Happy Dockerizing! 🐳✨
