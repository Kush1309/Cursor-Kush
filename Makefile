.PHONY: help build run stop restart logs shell clean prune health

# Default target
help:
	@echo "AI Agent Builder - Docker Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  build      - Build Docker image"
	@echo "  up         - Start containers with docker-compose"
	@echo "  down       - Stop containers"
	@echo "  restart    - Restart containers"
	@echo "  logs       - View logs"
	@echo "  shell      - Open shell in container"
	@echo "  health     - Check container health"
	@echo "  clean      - Remove containers and images"
	@echo "  prune      - Clean up Docker system"
	@echo "  ps         - List running containers"
	@echo "  stats      - Show container stats"

# Build image
build:
	docker-compose build

# Start containers
up:
	docker-compose up -d
	@echo "✅ Containers started!"
	@echo "🌐 Open: http://localhost:3001"

# Stop containers
down:
	docker-compose down

# Restart containers
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f

# Open shell
shell:
	docker exec -it ai-agent-builder sh

# Check health
health:
	@curl -s http://localhost:3001/health | json_pp || echo "❌ Health check failed"

# List containers
ps:
	docker-compose ps

# Show stats
stats:
	docker stats ai-agent-builder

# Clean up
clean:
	docker-compose down -v
	docker rmi ai-agent-builder:latest || true

# Prune system
prune:
	docker system prune -af --volumes

# Rebuild and start
rebuild: clean build up

# Production build
prod:
	docker-compose -f docker-compose.yml up -d --build
