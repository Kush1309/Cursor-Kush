% Demo Slides: Microservice Pipeline

---

# Slide 1 — Title

Microservice pipeline: `ai-agent` → `executor`

Objective: demo delegation of terminal execution to a dedicated microservice.

---

# Slide 2 — Architecture

```mermaid
flowchart LR
  subgraph App
    A[ai-agent (server.js)]
  end
  subgraph Exec
    B[executor (server)]
  end
  A -->|HTTP POST /execute| B
  B -->|exec command| OS[host shell]
  B -->|returns stdout/stderr| A
```

---

# Slide 3 — Demo steps

1. Start services (Docker or local)
2. Show health endpoints: `/health`
3. POST `/execute` and show results
4. Tail logs to show request flow

---

# Slide 4 — Security & Next steps

- Add auth token or mTLS
- Whitelist allowed commands
- Limit resources and drop privileges
