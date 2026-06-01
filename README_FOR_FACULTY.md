# Demo: Microservice Pipeline (Main app + Executor)

Objective
- Show how the main application delegates command execution to a separate `executor` microservice.

What I added
- `executor` microservice: [executor/server.js](executor/server.js)
- Main server changes (forwards execution): [server.js](server.js)
- Docker Compose wiring: [docker-compose.yml](docker-compose.yml) and [docker-compose.dev.yml](docker-compose.dev.yml)

Quick prerequisites
- Docker Desktop (or docker & docker-compose) OR Node.js + npm for local dev
- Port 3001 (main app) and 4000 (executor) available

Run with Docker (recommended)
1. Build & start:
```bash
docker-compose up --build -d
```
2. Verify containers:
```bash
docker-compose ps
```
3. Health checks:
```bash
curl http://localhost:4000/health
curl http://localhost:3001/health
```
4. Execute a sample command on the executor:
```bash
curl -X POST http://localhost:4000/execute \
  -H "Content-Type: application/json" \
  -d '{"command":"echo hello from executor"}'
```

Run locally (no Docker)
1. Start executor:
```powershell
cd executor
npm install
node server.js
```
2. Start main server (root):
```powershell
cd ..
npm install
npm run dev
```

Live demo script (what to show)
1. Show architecture diagram (open `demo_slides.md`).
2. Start services (or show `docker-compose ps` if already running).
3. Curl health endpoints and show responses.
4. POST to `/execute` and show the returned stdout/stderr.
5. Tail logs (`docker-compose logs -f ai-agent executor`) to show the request flow.

Security notes (must mention to faculty)
- The executor currently runs arbitrary shell commands. This is inherently dangerous. For any production or public demo:
  - Add authentication (API token / mTLS)
  - Add command whitelisting and input validation
  - Run the executor under a restricted user and with resource limits
  - Log and rate-limit requests

Files to share
- `executor/` — service code and Dockerfile
- `server.js` — forwarding change
- `docker-compose.yml` and `docker-compose.dev.yml`

If you want, I can also:
- Record a short (2–3 minute) screencast of the demo
- Generate a one-slide PDF from the diagram
- Add a simple auth token to the executor for safer demos
