# Pastebin Lite

A full-stack pastebin application with **React frontend** and **Node.js backend**, featuring time-based expiry (TTL) and view count limits.

## 🏗️ Project Structure

```
pastebin-lite/
├── backend/                 # Node.js + Express API
│   ├── config/
│   │   └── redis.js        # Redis configuration
│   ├── routes/
│   │   ├── health.js       # Health check endpoint
│   │   └── pastes.js       # Paste CRUD operations
│   ├── server.js           # Express server
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
│
├── frontend/               # React application
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CreatePaste.js    # Create paste page
│   │   │   ├── CreatePaste.css
│   │   │   ├── ViewPaste.js      # View paste page
│   │   │   └── ViewPaste.css
│   │   ├── App.js         # Main app with routing
│   │   ├── App.css
│   │   ├── index.js       # React entry point
│   │   └── index.css
│   └── package.json       # Frontend dependencies
│
└── README.md              # This file
```

## ✨ Features

- 📝 Create and share text pastes with unique URLs
- ⏱️ Optional time-to-live (TTL) expiry
- 👁️ Optional view count limits
- 🎨 Beautiful, responsive React UI
- 🔒 XSS protection
- ⚡ Fast Redis-backed persistence
- 🧪 Test mode support for automated testing

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router 6** - Client-side routing
- **CSS3** - Styling (no frameworks)

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Redis (ioredis)** - Database
- **nanoid** - ID generation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Redis server running (local or cloud)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd pastebin-lite

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Setup Redis

**Option A: Docker (Easiest)**
```bash
docker run -d -p 6379:6379 redis:alpine
```

**Option B: Local Installation**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo service redis-server start
```

**Option C: Cloud Redis (Upstash - Free)**
1. Go to https://console.upstash.com/
2. Create account → Create database
3. Copy the Redis URL

### Step 3: Configure Environment

```bash
# In backend folder
cp .env.example .env

# Edit .env file
nano .env
```

**For local development:**
```env
PORT=5000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
FRONTEND_URL=http://localhost:3000
TEST_MODE=1
```

**For cloud Redis:**
```env
PORT=5000
REDIS_URL=redis://your-redis-url
FRONTEND_URL=http://localhost:3000
TEST_MODE=1
```

### Step 4: Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
# App opens at http://localhost:3000
```

The frontend will proxy API requests to the backend automatically.

## 📖 API Documentation

### Health Check
```
GET /api/healthz
Response: {"ok": true}
```

### Create Paste
```
POST /api/pastes
Body: {
  "content": "string (required)",
  "ttl_seconds": integer >= 1 (optional),
  "max_views": integer >= 1 (optional)
}
Response: {
  "id": "abc123xyz",
  "url": "http://localhost:3000/p/abc123xyz"
}
```

### Get Paste
```
GET /api/pastes/:id
Response: {
  "content": "string",
  "remaining_views": integer | null,
  "expires_at": "ISO8601" | null
}
```

## 🧪 Testing

### Manual Testing

```bash
# Health check
curl http://localhost:5000/api/healthz

# Create paste
curl -X POST http://localhost:5000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Test paste","ttl_seconds":60,"max_views":5}'

# View paste
curl http://localhost:5000/api/pastes/<paste-id>
```

### Test Mode

The application supports deterministic testing via `TEST_MODE=1`:

```bash
# Create paste with 60s TTL
curl -X POST http://localhost:5000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Test","ttl_seconds":60}'

# Test before expiry
curl http://localhost:5000/api/pastes/<id> \
  -H "x-test-now-ms: 1000000000000"

# Test after expiry (should return 404)
curl http://localhost:5000/api/pastes/<id> \
  -H "x-test-now-ms: 1000000061000"
```

## 🌐 Deployment

### Deploy Backend (Railway - Free)

1. **Create Railway Account**
   - Go to https://railway.app/
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   cd backend
   railway login
   railway init
   railway up
   ```

3. **Add Redis**
   - In Railway dashboard: New → Database → Redis
   - Railway auto-sets REDIS_URL

4. **Set Environment Variables**
   ```bash
   railway variables set FRONTEND_URL=https://your-frontend.vercel.app
   railway variables set TEST_MODE=1
   ```

### Deploy Frontend (Vercel - Free)

1. **Create Vercel Account**
   - Go to https://vercel.com/
   - Sign up with GitHub

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Update Backend URL**
   - In `frontend/package.json`, update proxy to your Railway backend URL
   - Or use environment variable in production

### Alternative: Deploy Both Together (Render)

1. **Backend as Web Service**
   - Root: `backend`
   - Build: `npm install`
   - Start: `npm start`

2. **Frontend as Static Site**
   - Root: `frontend`
   - Build: `npm run build`
   - Publish: `build`

## 📁 Detailed File Structure

### Backend Files

- **server.js** - Express server setup, middleware, routes
- **config/redis.js** - Redis client initialization and time utilities
- **routes/health.js** - Health check endpoint
- **routes/pastes.js** - Create and retrieve paste endpoints

### Frontend Files

- **src/App.js** - Main component with React Router
- **src/pages/CreatePaste.js** - Create paste form and logic
- **src/pages/ViewPaste.js** - View paste display and logic
- **src/index.js** - React entry point

## 🔐 Security Features

1. **XSS Protection** - Content rendered as text, not HTML
2. **Input Validation** - Server-side validation for all inputs
3. **CORS** - Configured for frontend origin
4. **Environment Variables** - Secrets not committed to code

## 💾 Persistence Layer

This application uses **Redis** for persistence:

- Fast key-value operations (O(1))
- Native TTL support for automatic expiry
- Atomic operations for view counting
- Scales horizontally
- Works with serverless platforms

### Redis Data Structure

```javascript
Key: "paste:{id}"
Value: JSON {
  "content": "string",
  "created_at": timestamp,
  "views": integer,
  "max_views": integer (optional),
  "expires_at": timestamp (optional)
}
TTL: auto-expires based on ttl_seconds
```

## 🎯 Design Decisions

### Why Separate Frontend/Backend?

- **Clear separation of concerns**
- **Independent scaling** - Scale frontend and backend separately
- **Better development** - Frontend and backend teams can work independently
- **Flexible deployment** - Deploy to different platforms

### Why React?

- **Component-based** - Reusable UI components
- **Fast rendering** - Virtual DOM for performance
- **Rich ecosystem** - Large community and libraries
- **Modern development** - Hooks, routing, state management

### Why Redis?

- **Speed** - In-memory database, sub-millisecond latency
- **TTL Support** - Native expiry, no manual cleanup
- **Simple** - Key-value store, easy to understand
- **Scalable** - Handles millions of operations/second

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Use different port
PORT=5001 npm start
```

### Frontend won't connect to backend
```bash
# Check backend is running
curl http://localhost:5000/api/healthz

# Check proxy in frontend/package.json
"proxy": "http://localhost:5000"
```

### Redis connection failed
```bash
# Test Redis connection
redis-cli ping  # Should return "PONG"

# Check Redis is running
redis-cli info server
```
