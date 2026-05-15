const API_URL = 'http://localhost:3001/api';

let currentSessionId = null;
let isLoading = false;

// DOM Elements
const sidebar = document.getElementById('sidebar');
const chatView = document.getElementById('chatView');
const architectureView = document.getElementById('architectureView');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const chatHistory = document.getElementById('chatHistory');
const architectureBtn = document.getElementById('architectureBtn');
const backToChat = document.getElementById('backToChat');
const toggleSidebar = document.getElementById('toggleSidebar');
const toggleSidebar2 = document.getElementById('toggleSidebar2');
const chatTitle = document.getElementById('chatTitle');

// Initialize
async function init() {
    await loadSessions();
    await createNewSession();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    newChatBtn.addEventListener('click', createNewSession);
    architectureBtn.addEventListener('click', showArchitecture);
    
    // Pipeline button
    const pipelineBtn = document.getElementById('pipelineBtn');
    if (pipelineBtn) {
        pipelineBtn.addEventListener('click', () => {
            window.location.href = 'pipeline.html';
        });
    }
    
    backToChat.addEventListener('click', showChat);
    toggleSidebar.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    toggleSidebar2.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    
    messageInput.addEventListener('input', autoResize);
}

function autoResize() {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
}

// Session Management
async function loadSessions() {
    try {
        const response = await fetch(`${API_URL}/sessions`);
        const sessions = await response.json();
        renderSessions(sessions);
    } catch (error) {
        console.error('Failed to load sessions:', error);
    }
}

async function createNewSession() {
    try {
        const response = await fetch(`${API_URL}/sessions`, { method: 'POST' });
        const { id } = await response.json();
        currentSessionId = id;
        clearMessages();
        chatTitle.textContent = 'AI Agent Builder';
        await loadSessions();
    } catch (error) {
        console.error('Failed to create session:', error);
    }
}

async function loadSession(sessionId) {
    try {
        const response = await fetch(`${API_URL}/sessions/${sessionId}`);
        const session = await response.json();
        currentSessionId = sessionId;
        chatTitle.textContent = session.title;
        renderMessages(session.messages);
        
        document.querySelectorAll('.history-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === sessionId);
        });
    } catch (error) {
        console.error('Failed to load session:', error);
    }
}

async function deleteSession(sessionId, event) {
    event.stopPropagation();
    try {
        await fetch(`${API_URL}/sessions/${sessionId}`, { method: 'DELETE' });
        if (currentSessionId === sessionId) {
            await createNewSession();
        }
        await loadSessions();
    } catch (error) {
        console.error('Failed to delete session:', error);
    }
}

// Rendering
function renderSessions(sessions) {
    chatHistory.innerHTML = sessions.map(s => `
        <div class="history-item ${s.id === currentSessionId ? 'active' : ''}" 
             data-id="${s.id}" 
             onclick="loadSession('${s.id}')">
            <div class="history-item-header">
                <div class="history-item-title">${escapeHtml(s.title)}</div>
                <button class="delete-btn" onclick="deleteSession('${s.id}', event)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="history-item-date">${formatDate(s.createdAt)}</div>
        </div>
    `).join('');
}

function renderMessages(messages) {
    clearMessages();
    messages.forEach(msg => {
        if (msg.role === 'user') {
            addUserMessage(msg.content);
        } else if (msg.role === 'assistant') {
            addAssistantMessage(msg.content, msg.toolCalls);
        }
    });
}

function clearMessages() {
    messagesContainer.innerHTML = '';
}

function addUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message user';
    msgDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${escapeHtml(text)}</div>
        </div>
    `;
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
}

function addAssistantMessage(text, toolCalls = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message assistant';
    
    let toolCallsHtml = '';
    if (toolCalls && toolCalls.length > 0) {
        toolCallsHtml = `
            <div class="tool-calls">
                <div class="tool-calls-header">
                    <i class="fas fa-code"></i> Code Execution
                </div>
                ${toolCalls.map(tc => {
                    const args = tc.args || {};
                    const command = args.command || '';
                    const result = tc.result || '';
                    
                    return `
                        <div class="tool-call">
                            <div class="tool-call-label">
                                <i class="fas fa-terminal"></i> Command
                            </div>
                            <div class="code-block">
                                <pre><code>${escapeHtml(command)}</code></pre>
                            </div>
                            <div class="tool-call-label">
                                <i class="fas fa-check-circle"></i> Output
                            </div>
                            <div class="output-block">
                                <pre><code>${escapeHtml(result)}</code></pre>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    // Format the message text to preserve code blocks
    const formattedText = formatMessageText(text);
    
    msgDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${formattedText}</div>
            ${toolCallsHtml}
        </div>
    `;
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
}

function formatMessageText(text) {
    // Escape HTML first
    const escaped = escapeHtml(text);
    
    // Convert code blocks (```code```) to formatted blocks
    let formatted = escaped.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<div class="inline-code-block"><pre><code>${code.trim()}</code></pre></div>`;
    });
    
    // Convert inline code (`code`) to formatted inline
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    // Convert newlines to <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

function addLoadingMessage() {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message assistant loading-message';
    msgDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="loading">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        </div>
    `;
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
    return msgDiv;
}

// Send Message with Streaming
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || isLoading || !currentSessionId) return;
    
    isLoading = true;
    sendBtn.disabled = true;
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    addUserMessage(text);
    
    // Create assistant message container for streaming
    const assistantMsgDiv = document.createElement('div');
    assistantMsgDiv.className = 'message assistant';
    assistantMsgDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-text"></div>
            <div class="tool-calls-container"></div>
        </div>
    `;
    messagesContainer.appendChild(assistantMsgDiv);
    
    const messageTextDiv = assistantMsgDiv.querySelector('.message-text');
    const toolCallsContainer = assistantMsgDiv.querySelector('.tool-calls-container');
    
    let fullText = '';
    let toolCalls = [];
    
    try {
        const response = await fetch(`${API_URL}/sessions/${currentSessionId}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = JSON.parse(line.slice(6));
                    
                    if (data.type === 'text') {
                        fullText += data.content;
                        messageTextDiv.innerHTML = formatMessageText(fullText);
                        scrollToBottom();
                    } else if (data.type === 'title') {
                        chatTitle.textContent = data.content;
                    } else if (data.type === 'tool_start') {
                        // Add tool execution indicator
                        const toolDiv = document.createElement('div');
                        toolDiv.className = 'tool-call streaming';
                        toolDiv.dataset.toolName = data.name;
                        toolDiv.innerHTML = `
                            <div class="tool-call-label">
                                <i class="fas fa-terminal"></i> Executing Command
                            </div>
                            <div class="code-block">
                                <pre><code>${escapeHtml(data.args.command || JSON.stringify(data.args))}</code></pre>
                            </div>
                            <div class="loading">
                                <div class="loading-dot"></div>
                                <div class="loading-dot"></div>
                                <div class="loading-dot"></div>
                            </div>
                        `;
                        
                        if (toolCallsContainer.children.length === 0) {
                            const header = document.createElement('div');
                            header.className = 'tool-calls-header';
                            header.innerHTML = '<i class="fas fa-code"></i> Code Execution';
                            toolCallsContainer.appendChild(header);
                        }
                        
                        toolCallsContainer.appendChild(toolDiv);
                        scrollToBottom();
                    } else if (data.type === 'tool_result') {
                        // Update tool with result
                        const toolDiv = Array.from(toolCallsContainer.querySelectorAll('.tool-call')).find(
                            div => div.dataset.toolName === data.name && div.classList.contains('streaming')
                        );
                        
                        if (toolDiv) {
                            toolDiv.classList.remove('streaming');
                            const loadingDiv = toolDiv.querySelector('.loading');
                            if (loadingDiv) loadingDiv.remove();
                            
                            const resultDiv = document.createElement('div');
                            resultDiv.innerHTML = `
                                <div class="tool-call-label">
                                    <i class="fas fa-check-circle"></i> Output
                                </div>
                                <div class="output-block">
                                    <pre><code>${escapeHtml(data.result)}</code></pre>
                                </div>
                            `;
                            toolDiv.appendChild(resultDiv);
                        }
                        
                        toolCalls.push(data);
                        scrollToBottom();
                    } else if (data.type === 'done') {
                        await loadSessions();
                    } else if (data.type === 'error') {
                        messageTextDiv.innerHTML = `<span style="color: var(--error);">Error: ${escapeHtml(data.content)}</span>`;
                    }
                }
            }
        }
    } catch (error) {
        messageTextDiv.innerHTML = `<span style="color: var(--error);">Error: ${escapeHtml(error.message)}</span>`;
    } finally {
        isLoading = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

// View Navigation
function showArchitecture() {
    chatView.classList.add('hidden');
    architectureView.classList.remove('hidden');
}

function showChat() {
    architectureView.classList.add('hidden');
    chatView.classList.remove('hidden');
}

// Utilities
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Start the app
init();
