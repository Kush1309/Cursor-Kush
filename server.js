import "dotenv/config";
import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import Groq from "groq-sdk";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const platform = os.platform();
const asyncExecute = promisify(exec);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// In-memory session store: { sessionId: { title, messages: [], createdAt } }
const sessions = {};

// ---------------- TOOL ----------------
async function executeCommand({ command }) {
  const url = process.env.EXECUTOR_URL || 'http://executor:4000/execute';
  try {
    let fetchFn = global.fetch;
    if (!fetchFn) {
      const nodeFetch = await import('node-fetch');
      fetchFn = nodeFetch.default;
    }

    const resp = await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });

    const data = await resp.json();
    return data.result ?? (data.success === false ? data.result : JSON.stringify(data));
  } catch (err) {
    return `Error: ${err.message}`;
  }
}

const tools = [
  {
    type: "function",
    function: {
      name: "executeCommand",
      description: "Execute a single terminal/shell command",
      parameters: {
        type: "object",
        properties: {
          command: { type: "string", description: "Single terminal command" },
        },
        required: ["command"],
      },
    },
  },
];

const availableTools = { executeCommand };

// ---------------- AGENT RUNNER WITH STREAMING ----------------
async function runAgentStreaming(history, userProblem, onChunk) {
  history.push({ role: "user", content: userProblem });

  const steps = [];
  let fullResponse = "";

  while (true) {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an AI agent that helps users build projects by executing terminal commands.

CRITICAL - OPERATING SYSTEM: ${platform}
${platform === 'win32' ? `
YOU ARE ON WINDOWS! Use PowerShell/CMD commands:
- List files: dir or Get-ChildItem
- Create file: echo content > file.txt or New-Item
- Create folder: mkdir foldername
- Read file: type file.txt or Get-Content
- Delete: del file.txt or Remove-Item
- DO NOT use: touch, cat, ls, rm (these are Linux/Mac commands)
` : `
YOU ARE ON LINUX/MAC! Use bash commands:
- List files: ls
- Create file: touch file.txt or echo content > file.txt
- Create folder: mkdir foldername
- Read file: cat file.txt
- Delete: rm file.txt
`}

IMPORTANT INSTRUCTIONS:
1. When a user asks you to create code or files, ALWAYS show the code in your response using markdown code blocks
2. Then execute the necessary commands to create the files using the CORRECT OS commands
3. Format code blocks like this:
   \`\`\`javascript
   // code here
   \`\`\`
4. After showing the code, use the executeCommand tool to create the files
5. Always explain what you're doing before executing commands
6. Show the complete code in your response so users can see it in the chat
7. Use the correct commands for the user's operating system (${platform})

Example workflow for Windows:
User: "Create a calculator in JavaScript"
You: "I'll create a calculator for you. Here's the code:

\`\`\`javascript
function calculator(a, b, operation) {
  switch(operation) {
    case 'add': return a + b;
    case 'subtract': return a - b;
    case 'multiply': return a * b;
    case 'divide': return a / b;
  }
}
\`\`\`

Now I'll create the file using Windows commands..."
[Then use executeCommand with: echo "code here" > calculator.js]`,
        },
        ...history,
      ],
      tools,
      tool_choice: "auto",
      stream: true, // Enable streaming
    });

    let currentMessage = { role: "assistant", content: "" };
    let toolCalls = [];

    // Process streaming response
    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta;
      
      if (delta?.content) {
        currentMessage.content += delta.content;
        fullResponse += delta.content;
        
        // Send text chunk to client
        onChunk({
          type: 'text',
          content: delta.content
        });
      }

      if (delta?.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          if (!toolCalls[toolCall.index]) {
            toolCalls[toolCall.index] = {
              id: toolCall.id,
              type: toolCall.type,
              function: { name: "", arguments: "" }
            };
          }
          
          if (toolCall.function?.name) {
            toolCalls[toolCall.index].function.name = toolCall.function.name;
          }
          
          if (toolCall.function?.arguments) {
            toolCalls[toolCall.index].function.arguments += toolCall.function.arguments;
          }
        }
      }
    }

    // If we have tool calls, execute them
    if (toolCalls.length > 0) {
      currentMessage.tool_calls = toolCalls;
      history.push(currentMessage);

      for (const tc of toolCalls) {
        const fnName = tc.function.name;
        const fnArgs = JSON.parse(tc.function.arguments);
        
        // Notify client about tool execution
        onChunk({
          type: 'tool_start',
          name: fnName,
          args: fnArgs
        });

        const toolFn = availableTools[fnName];
        const result = toolFn ? await toolFn(fnArgs) : `Error: Tool '${fnName}' not found`;

        steps.push({ type: "tool", name: fnName, args: fnArgs, result });

        // Send tool result to client
        onChunk({
          type: 'tool_result',
          name: fnName,
          args: fnArgs,
          result: result
        });

        history.push({
          tool_call_id: tc.id,
          role: "tool",
          name: fnName,
          content: result,
        });
      }
    } else if (currentMessage.content) {
      // Final response
      history.push({ role: "assistant", content: currentMessage.content });
      steps.push({ type: "final", content: currentMessage.content });
      break;
    }

    if (history.length > 30) history.splice(1, 10);
  }

  return steps;
}

// ---------------- ROUTES ----------------

// Health check endpoint for Docker
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Get all sessions (sidebar history)
app.get("/api/sessions", (req, res) => {
  const list = Object.entries(sessions).map(([id, s]) => ({
    id,
    title: s.title,
    createdAt: s.createdAt,
  }));
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

// Create new session
app.post("/api/sessions", (req, res) => {
  const id = uuidv4();
  sessions[id] = { title: "New Chat", messages: [], createdAt: new Date().toISOString() };
  res.json({ id });
});

// Get session messages
app.get("/api/sessions/:id", (req, res) => {
  const s = sessions[req.params.id];
  if (!s) return res.status(404).json({ error: "Session not found" });
  res.json(s);
});

// Delete session
app.delete("/api/sessions/:id", (req, res) => {
  delete sessions[req.params.id];
  res.json({ ok: true });
});

// Send message to agent with streaming
app.post("/api/sessions/:id/chat", async (req, res) => {
  const s = sessions[req.params.id];
  if (!s) return res.status(404).json({ error: "Session not found" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });

  // Set title from first message
  if (s.messages.length === 0) {
    s.title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
  }

  // Store user message for UI
  s.messages.push({ role: "user", content: message, timestamp: new Date().toISOString() });

  // Set headers for SSE (Server-Sent Events)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Run agent with a copy of history (only role/content pairs for groq)
    const groqHistory = s.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    // Remove last user message since runAgent will add it
    groqHistory.pop();

    // Send session title first
    res.write(`data: ${JSON.stringify({ type: 'title', content: s.title })}\n\n`);

    const steps = await runAgentStreaming(groqHistory, message, (chunk) => {
      // Send each chunk to the client
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    });

    // Find final response
    const finalStep = steps.find((s) => s.type === "final");
    const toolSteps = steps.filter((s) => s.type === "tool");

    const assistantContent = finalStep?.content || "Done.";

    s.messages.push({
      role: "assistant",
      content: assistantContent,
      toolCalls: toolSteps,
      timestamp: new Date().toISOString(),
    });

    // Send done signal
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (err) {
    console.error(err);
    res.write(`data: ${JSON.stringify({ type: 'error', content: err.message })}\n\n`);
    res.end();
  }
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

export default app;
