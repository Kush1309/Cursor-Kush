# AI Agent Builder 🤖

A real-time AI agent web application with streaming responses, just like Cursor and ChatGPT.

## 🚀 Quick Start

### Option 1: Docker (Recommended) 🐳

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Add your GROQ_API_KEY to .env

# 3. Start with Docker Compose
docker-compose up -d

# 4. Open browser
http://localhost:3001
```

### Option 2: Local Development

```bash
npm install
npm start
```

Open: **http://localhost:3001**

## ✨ Features

- 💬 **Real-time Streaming** - Responses appear word-by-word
- 🎨 **Beautiful UI** - Dark theme with #140B7A color
- 📁 **Chat History** - Save and manage conversations
- 🏗️ **Architecture View** - See how the system works
- 🔧 **Code Execution** - Run commands and see results in chat
- 📱 **Responsive** - Works on desktop and mobile
- 🐳 **Docker Ready** - Full Docker support with all features

## 🐳 Docker Features

- ✅ Multi-stage builds (optimized image size)
- ✅ Health checks (automatic monitoring)
- ✅ Resource limits (CPU & memory)
- ✅ Persistent volumes (data survives restarts)
- ✅ Non-root user (security)
- ✅ Log rotation (automatic cleanup)
- ✅ Hot reload (development mode)
- ✅ Docker Compose (easy orchestration)

## 📋 Docker Commands

```bash
# Production
docker-compose up -d              # Start
docker-compose down               # Stop
docker-compose logs -f            # View logs
docker-compose restart            # Restart

# Development (with hot reload)
docker-compose -f docker-compose.dev.yml up

# Using Makefile
make up                           # Start
make down                         # Stop
make logs                         # View logs
make shell                        # Open shell
make health                       # Check health
```

## 🎯 What You Can Do

Ask the AI to:
- Create code files
- Build web pages
- Write functions
- Execute commands
- And more!

## 🔧 Configuration

### Environment Variables

```bash
GROQ_API_KEY=your_api_key_here    # Required
PORT=3001                          # Optional
NODE_ENV=production                # Optional
```

### Docker Compose

```yaml
# Resource limits (edit docker-compose.yml)
resources:
  limits:
    cpus: '1'
    memory: 512M
```

## 📚 Documentation

- **[DOCKER.md](DOCKER.md)** - Complete Docker guide
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start guide
- **[PROJECT.md](PROJECT.md)** - Project structure

## 📊 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **AI**: Groq LLaMA 3.3 70B (with streaming)
- **Container**: Docker, Docker Compose

## 🔒 Security

- Non-root user in container
- Minimal Alpine base image
- No secrets in image
- Health checks enabled
- Resource limits configured

## 📝 License

ISC
