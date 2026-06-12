# AI_USAGE.md — AI Tools & Logic Log

## 1. AI Tools Used
- **Antigravity (Assistant)**: Multi-step planning, file creation, and environment setup.
- **Groq (LLaMA 3.3 70B)**: Real-time agent logic and function calling.

## 2. Key Prompts
- *"Create a microservice pipeline where an AI agent can delegate shell execution to a separate service."*
- *"Implement an anomaly detector for a CSV file and log every skipped row."*
- *"Design a dark-themed CSS system for a real-time streaming dashboard."*

## 3. Concrete Failure Cases & Solutions

### Case 1: Incorrect PowerShell Syntax
- **Problem**: AI produced `ls -la` and `touch` commands while on a Windows environment.
- **Caught By**: Terminal error "The term 'ls' is not recognized".
- **Change**: Updated the System Prompt to explicitly check `os.platform()` and enforce `Get-ChildItem` and `New-Item` for Windows.

### Case 2: SSE Memory Leak
- **Problem**: AI suggested `res.send()` instead of `res.write()` for streaming.
- **Caught By**: Interaction stopped after the first chunk; no continuous stream.
- **Change**: Manually corrected the Express handler to use `res.setHeader('Content-Type', 'text/event-stream')` and `res.write()`.

### Case 3: Docker Resource Deadlock
- **Problem**: AI set memory limits too low (64MB) for Node.js, causing `OOM Killed`.
- **Caught By**: `docker inspect` showed OOM exit code.
- **Change**: Increased memory limits to 512MB and enabled swap in `docker-compose.yml`.
