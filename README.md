# SocialHub – Social Media Dashboard

A full-stack social media dashboard built with the MERN stack, Socket.IO for real-time messaging, and Redis for notifications.

## Features

- **User Profiles** – avatars, bio, follow/unfollow system
- **Real-time Messaging** – WebSocket-powered chat with typing indicators
- **Feed** – like, comment, and share posts
- **Analytics Dashboard** – engagement charts and post performance
- **Notification System** – Redis pub/sub powered push notifications

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO |
| Cache/Notifications | Redis (ioredis) |
| State | Zustand + React Query |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Redis

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/social-media-dashboard.git
cd social-media-dashboard

# Backend setup
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
social-media-dashboard/
├── backend/
│   ├── config/          # DB & Redis connections
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── socket/          # Socket.IO handler
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Reusable UI components
        ├── context/     # Auth & Socket providers
        ├── pages/       # Route pages
        └── services/    # API layer
```

## License
MIT
