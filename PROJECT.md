# Project Structure

```
ai-agent-builder/
├── public/              # Frontend files
│   ├── index.html      # Main UI
│   ├── styles.css      # Styling (#140B7A theme)
│   ├── app.js          # Frontend logic + streaming
│   └── favicon.svg     # Icon
│
├── server.js           # Backend + AI agent
├── .env                # API keys
├── package.json        # Dependencies
├── start.bat           # Windows startup
│
├── README.md           # Main docs
├── QUICKSTART.md       # Quick guide
└── PROJECT.md          # This file
```

## Key Features

✅ Real-time streaming responses (like ChatGPT/Cursor)
✅ Beautiful dark UI with #140B7A color
✅ Chat history management
✅ Architecture visualization
✅ Windows command support
✅ Code execution in chat

## Files Explained

- **server.js** - Express server with Groq AI streaming
- **public/app.js** - Handles streaming, UI updates
- **public/styles.css** - All styling and animations
- **public/index.html** - Chat + Architecture views
- **.env** - Contains GROQ_API_KEY

## Quick Commands

```bash
npm install    # Install dependencies
npm start      # Start server
```

Open: http://localhost:3001
