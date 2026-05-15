# How to Run This Project 🚀

## ✅ Clean Project - Ready to Run!

---

## 🐳 Option 1: Docker (Recommended)

### Prerequisites
- Docker Desktop installed and running

### Steps

1. **Start Docker Desktop** (if not running)

2. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

3. **Add your GROQ_API_KEY to .env**
   ```bash
   notepad .env
   ```

4. **Start the container**
   ```bash
   docker-compose up -d
   ```

5. **Open browser**
   ```
   http://localhost:3001
   ```

### Useful Commands
```bash
docker-compose ps          # Check status
docker-compose logs -f     # View logs
docker-compose down        # Stop
docker-compose restart     # Restart
```

---

## 💻 Option 2: Local Development

### Prerequisites
- Node.js 20+ installed

### Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add your GROQ_API_KEY to .env**
   ```bash
   notepad .env
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open browser**
   ```
   http://localhost:3001
   ```

---

## 📁 Project Structure

```
ai-agent-builder/
├── public/              # Frontend
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── favicon.svg
├── server.js            # Backend + AI
├── .env                 # Your API key
├── docker-compose.yml   # Docker config
└── README.md            # Documentation
```

---

## 🎯 What You Get

✅ Real-time AI streaming (like ChatGPT)
✅ Beautiful dark UI (#140B7A theme)
✅ Chat history management
✅ Code execution in chat
✅ Architecture visualization
✅ Fully Dockerized

---

## 🔧 Troubleshooting

### Docker won't start?
- Make sure Docker Desktop is running
- Check if port 3001 is available

### Local server won't start?
- Make sure you have Node.js 20+
- Run `npm install` first
- Check if .env has GROQ_API_KEY

---

## 📚 More Info

- **[README.md](README.md)** - Full documentation
- **[DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md)** - Docker guide
- **[QUICKSTART.md](QUICKSTART.md)** - Quick start

---

**Ready to build with AI!** 🤖✨
