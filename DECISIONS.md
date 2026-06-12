# DECISIONS.md — Decision Log

## 1. Architectural Choice: Microservices
**Option Considered**: Monolithic Architecture  
**Chosen**: Microservice Pipeline (Main Server + Executor)  
**Reason**: To separate sensitive terminal execution from the main agent logic. This allows for better resource limiting (Docker) and easier scaling of the execution environment.

## 2. LLM Engine: Groq LLaMA 3.3 70B
**Option Considered**: OpenAI GPT-4o  
**Chosen**: Groq LLaMA 3.3 70B  
**Reason**: Faster inference speed and competitive performance for technical tasks (code generation and tool calling) while keeping low latency for streaming.

## 3. Communication: Server-Sent Events (SSE)
**Option Considered**: WebSockets, REST Polling  
**Chosen**: SSE  
**Reason**: SSE is simpler to implement for one-way server-to-client streaming and works better with typical HTTP load balancers in a Dockerized environment.

## 4. UI: Vanilla JS & CSS
**Option Considered**: React, Tailwind  
**Chosen**: Vanilla JavaScript & CSS  
**Reason**: Zero-dependency frontend ensures ultra-fast load times and avoids build-step complexity for a demo-focused microservice.

## 5. Security: Non-Root Docker User
**Decision**: Forced all services to run as user `nodejs` (UID 1001).  
**Reason**: Prevents privilege escalation attacks if the executor service is compromised.
