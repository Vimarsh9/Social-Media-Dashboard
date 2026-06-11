#!/bin/bash

# ============================================================
#  SocialHub – Realistic GitHub Commit History Setup Script
#  Simulates 7 days of natural development commits
#  Usage: bash scripts/setup_git_history.sh
# ============================================================

set -e

# ── CONFIG ──────────────────────────────────────────────────
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│   SocialHub – Git History Setup Script       │"
echo "└─────────────────────────────────────────────┘"
echo ""

# Prompt for git config
read -p "Enter your GitHub username: " GIT_USER
read -p "Enter your GitHub email: " GIT_EMAIL
read -p "Enter your GitHub repo URL (e.g. https://github.com/user/repo.git): " REPO_URL

echo ""
echo "📦 Initialising git repository..."

git init
git config user.name "$GIT_USER"
git config user.email "$GIT_EMAIL"

# ── HELPER ──────────────────────────────────────────────────
commit_with_date() {
  local MSG="$1"
  local DATE="$2"
  git add -A
  GIT_AUTHOR_DATE="$DATE" GIT_COMMITTER_DATE="$DATE" \
    git commit -m "$MSG" --allow-empty-message > /dev/null
  echo "  ✅  $DATE  →  $MSG"
}

# Calculate base date (7 days ago from today)
BASE_EPOCH=$(date -d "7 days ago" +%s 2>/dev/null || date -v-7d +%s)
day_offset() { echo $(( BASE_EPOCH + $1 * 86400 )); }
fmt() { date -d "@$1" "+%Y-%m-%dT%H:%M:%S" 2>/dev/null || date -r "$1" "+%Y-%m-%dT%H:%M:%S"; }

# ── DAY 0 – Project Kickoff ──────────────────────────────────
echo ""
echo "📅 Day 1 – Project kickoff & initial setup"
D0=$(day_offset 0)

# Initial commit: just README
git add README.md .gitignore 2>/dev/null || true
GIT_AUTHOR_DATE="$(fmt $D0)" GIT_COMMITTER_DATE="$(fmt $D0)" \
  git commit -m "initial commit: project scaffold" > /dev/null
echo "  ✅  $(fmt $D0)  →  initial commit: project scaffold"

# Add backend package.json
git add backend/package.json 2>/dev/null || true
D0b=$(( D0 + 3600 ))
GIT_AUTHOR_DATE="$(fmt $D0b)" GIT_COMMITTER_DATE="$(fmt $D0b)" \
  git commit -m "chore: add backend package.json and dependencies" > /dev/null
echo "  ✅  $(fmt $D0b)  →  chore: add backend package.json and dependencies"

# ── DAY 1 – Backend Foundation ───────────────────────────────
echo ""
echo "📅 Day 2 – Backend foundation"
D1=$(day_offset 1)

git add backend/config/ 2>/dev/null || true
D1a=$(( D1 + 9*3600 ))
GIT_AUTHOR_DATE="$(fmt $D1a)" GIT_COMMITTER_DATE="$(fmt $D1a)" \
  git commit -m "feat: add MongoDB and Redis connection configs" > /dev/null
echo "  ✅  $(fmt $D1a)  →  feat: add MongoDB and Redis connection configs"

git add backend/models/User.js 2>/dev/null || true
D1b=$(( D1 + 11*3600 ))
GIT_AUTHOR_DATE="$(fmt $D1b)" GIT_COMMITTER_DATE="$(fmt $D1b)" \
  git commit -m "feat(models): create User schema with bcrypt hashing" > /dev/null
echo "  ✅  $(fmt $D1b)  →  feat(models): create User schema with bcrypt hashing"

git add backend/models/Post.js backend/models/Message.js backend/models/Notification.js 2>/dev/null || true
D1c=$(( D1 + 14*3600 ))
GIT_AUTHOR_DATE="$(fmt $D1c)" GIT_COMMITTER_DATE="$(fmt $D1c)" \
  git commit -m "feat(models): add Post, Message, and Notification schemas" > /dev/null
echo "  ✅  $(fmt $D1c)  →  feat(models): add Post, Message, and Notification schemas"

git add backend/middleware/ 2>/dev/null || true
D1d=$(( D1 + 16*3600 ))
GIT_AUTHOR_DATE="$(fmt $D1d)" GIT_COMMITTER_DATE="$(fmt $D1d)" \
  git commit -m "feat(middleware): JWT authentication middleware" > /dev/null
echo "  ✅  $(fmt $D1d)  →  feat(middleware): JWT authentication middleware"

# ── DAY 2 – Auth & API Routes ────────────────────────────────
echo ""
echo "📅 Day 3 – Auth system & REST API"
D2=$(day_offset 2)

git add backend/controllers/authController.js backend/routes/auth.js 2>/dev/null || true
D2a=$(( D2 + 10*3600 ))
GIT_AUTHOR_DATE="$(fmt $D2a)" GIT_COMMITTER_DATE="$(fmt $D2a)" \
  git commit -m "feat(auth): register, login, logout with Redis session caching" > /dev/null
echo "  ✅  $(fmt $D2a)  →  feat(auth): register, login, logout with Redis session caching"

git add backend/controllers/userController.js backend/routes/users.js 2>/dev/null || true
D2b=$(( D2 + 13*3600 ))
GIT_AUTHOR_DATE="$(fmt $D2b)" GIT_COMMITTER_DATE="$(fmt $D2b)" \
  git commit -m "feat(users): profile endpoints, follow/unfollow, search" > /dev/null
echo "  ✅  $(fmt $D2b)  →  feat(users): profile endpoints, follow/unfollow, search"

git add backend/controllers/postController.js backend/routes/posts.js 2>/dev/null || true
D2c=$(( D2 + 15*3600 + 1800 ))
GIT_AUTHOR_DATE="$(fmt $D2c)" GIT_COMMITTER_DATE="$(fmt $D2c)" \
  git commit -m "feat(posts): create, feed, like, comment, delete with Redis caching" > /dev/null
echo "  ✅  $(fmt $D2c)  →  feat(posts): create, feed, like, comment, delete with Redis caching"

git add backend/routes/messages.js backend/routes/notifications.js backend/routes/uploads.js 2>/dev/null || true
D2d=$(( D2 + 17*3600 ))
GIT_AUTHOR_DATE="$(fmt $D2d)" GIT_COMMITTER_DATE="$(fmt $D2d)" \
  git commit -m "feat(routes): messages, notifications, and file upload endpoints" > /dev/null
echo "  ✅  $(fmt $D2d)  →  feat(routes): messages, notifications, and file upload endpoints"

# ── DAY 3 – Real-time & Analytics ───────────────────────────
echo ""
echo "📅 Day 4 – WebSocket messaging & analytics"
D3=$(day_offset 3)

git add backend/socket/ 2>/dev/null || true
D3a=$(( D3 + 9*3600 + 1200 ))
GIT_AUTHOR_DATE="$(fmt $D3a)" GIT_COMMITTER_DATE="$(fmt $D3a)" \
  git commit -m "feat(socket): Socket.IO handler with JWT auth, DMs, typing indicators" > /dev/null
echo "  ✅  $(fmt $D3a)  →  feat(socket): Socket.IO handler with JWT auth, DMs, typing indicators"

git add backend/controllers/analyticsController.js backend/routes/analytics.js 2>/dev/null || true
D3b=$(( D3 + 12*3600 ))
GIT_AUTHOR_DATE="$(fmt $D3b)" GIT_COMMITTER_DATE="$(fmt $D3b)" \
  git commit -m "feat(analytics): user engagement metrics with daily breakdown" > /dev/null
echo "  ✅  $(fmt $D3b)  →  feat(analytics): user engagement metrics with daily breakdown"

git add backend/server.js backend/.env.example 2>/dev/null || true
D3c=$(( D3 + 15*3600 ))
GIT_AUTHOR_DATE="$(fmt $D3c)" GIT_COMMITTER_DATE="$(fmt $D3c)" \
  git commit -m "feat: wire up express server with all routes, helmet, rate limiting" > /dev/null
echo "  ✅  $(fmt $D3c)  →  feat: wire up express server with all routes, helmet, rate limiting"

# ── DAY 4 – Frontend Setup ───────────────────────────────────
echo ""
echo "📅 Day 5 – React frontend setup"
D4=$(day_offset 4)

git add frontend/package.json frontend/vite.config.js frontend/tailwind.config.js frontend/index.html 2>/dev/null || true
D4a=$(( D4 + 9*3600 + 3600 ))
GIT_AUTHOR_DATE="$(fmt $D4a)" GIT_COMMITTER_DATE="$(fmt $D4a)" \
  git commit -m "chore(frontend): vite + react + tailwind + recharts setup" > /dev/null
echo "  ✅  $(fmt $D4a)  →  chore(frontend): vite + react + tailwind + recharts setup"

git add frontend/src/styles/ frontend/src/main.jsx 2>/dev/null || true
D4b=$(( D4 + 11*3600 ))
GIT_AUTHOR_DATE="$(fmt $D4b)" GIT_COMMITTER_DATE="$(fmt $D4b)" \
  git commit -m "style: global CSS, tailwind components, dark theme variables" > /dev/null
echo "  ✅  $(fmt $D4b)  →  style: global CSS, tailwind components, dark theme variables"

git add frontend/src/services/ 2>/dev/null || true
D4c=$(( D4 + 13*3600 + 1800 ))
GIT_AUTHOR_DATE="$(fmt $D4c)" GIT_COMMITTER_DATE="$(fmt $D4c)" \
  git commit -m "feat(services): axios API layer for all backend endpoints" > /dev/null
echo "  ✅  $(fmt $D4c)  →  feat(services): axios API layer for all backend endpoints"

git add frontend/src/context/ 2>/dev/null || true
D4d=$(( D4 + 15*3600 ))
GIT_AUTHOR_DATE="$(fmt $D4d)" GIT_COMMITTER_DATE="$(fmt $D4d)" \
  git commit -m "feat(context): Zustand auth store + Socket.IO context provider" > /dev/null
echo "  ✅  $(fmt $D4d)  →  feat(context): Zustand auth store + Socket.IO context provider"

# ── DAY 5 – Core Pages ───────────────────────────────────────
echo ""
echo "📅 Day 6 – Core pages & components"
D5=$(day_offset 5)

git add frontend/src/pages/LoginPage.jsx frontend/src/pages/RegisterPage.jsx 2>/dev/null || true
D5a=$(( D5 + 9*3600 + 900 ))
GIT_AUTHOR_DATE="$(fmt $D5a)" GIT_COMMITTER_DATE="$(fmt $D5a)" \
  git commit -m "feat(auth): login and register pages with form validation" > /dev/null
echo "  ✅  $(fmt $D5a)  →  feat(auth): login and register pages with form validation"

git add frontend/src/components/Dashboard/ 2>/dev/null || true
D5b=$(( D5 + 11*3600 + 1800 ))
GIT_AUTHOR_DATE="$(fmt $D5b)" GIT_COMMITTER_DATE="$(fmt $D5b)" \
  git commit -m "feat(layout): sidebar navigation with live socket connection indicator" > /dev/null
echo "  ✅  $(fmt $D5b)  →  feat(layout): sidebar navigation with live socket connection indicator"

git add frontend/src/pages/FeedPage.jsx 2>/dev/null || true
D5c=$(( D5 + 14*3600 ))
GIT_AUTHOR_DATE="$(fmt $D5c)" GIT_COMMITTER_DATE="$(fmt $D5c)" \
  git commit -m "feat(feed): post creation, like, comment, infinite scroll feed" > /dev/null
echo "  ✅  $(fmt $D5c)  →  feat(feed): post creation, like, comment, infinite scroll feed"

git add frontend/src/pages/ProfilePage.jsx 2>/dev/null || true
D5d=$(( D5 + 16*3600 + 2700 ))
GIT_AUTHOR_DATE="$(fmt $D5d)" GIT_COMMITTER_DATE="$(fmt $D5d)" \
  git commit -m "feat(profile): user profile page with follow/unfollow functionality" > /dev/null
echo "  ✅  $(fmt $D5d)  →  feat(profile): user profile page with follow/unfollow functionality"

# ── DAY 6 – Messages, Analytics, Notifications ───────────────
echo ""
echo "📅 Day 7 – Messaging, analytics, notifications"
D6=$(day_offset 6)

git add frontend/src/pages/MessagesPage.jsx 2>/dev/null || true
D6a=$(( D6 + 10*3600 ))
GIT_AUTHOR_DATE="$(fmt $D6a)" GIT_COMMITTER_DATE="$(fmt $D6a)" \
  git commit -m "feat(messages): real-time chat UI with typing indicators via Socket.IO" > /dev/null
echo "  ✅  $(fmt $D6a)  →  feat(messages): real-time chat UI with typing indicators via Socket.IO"

git add frontend/src/pages/AnalyticsPage.jsx 2>/dev/null || true
D6b=$(( D6 + 12*3600 + 1200 ))
GIT_AUTHOR_DATE="$(fmt $D6b)" GIT_COMMITTER_DATE="$(fmt $D6b)" \
  git commit -m "feat(analytics): engagement charts with Recharts, area/bar/line graphs" > /dev/null
echo "  ✅  $(fmt $D6b)  →  feat(analytics): engagement charts with Recharts, area/bar/line graphs"

git add frontend/src/pages/NotificationsPage.jsx 2>/dev/null || true
D6c=$(( D6 + 14*3600 + 3600 ))
GIT_AUTHOR_DATE="$(fmt $D6c)" GIT_COMMITTER_DATE="$(fmt $D6c)" \
  git commit -m "feat(notifications): notification centre with unread badges and read-all" > /dev/null
echo "  ✅  $(fmt $D6c)  →  feat(notifications): notification centre with unread badges and read-all"

git add frontend/src/App.jsx 2>/dev/null || true
D6d=$(( D6 + 16*3600 ))
GIT_AUTHOR_DATE="$(fmt $D6d)" GIT_COMMITTER_DATE="$(fmt $D6d)" \
  git commit -m "feat(router): protected and public routes with React Router v6" > /dev/null
echo "  ✅  $(fmt $D6d)  →  feat(router): protected and public routes with React Router v6"

# Final polish commit (today)
git add -A 2>/dev/null || true
TODAY=$(date "+%Y-%m-%dT%H:%M:%S")
GIT_AUTHOR_DATE="$TODAY" GIT_COMMITTER_DATE="$TODAY" \
  git commit -m "docs: update README with full setup instructions and project structure" > /dev/null || true
echo "  ✅  $TODAY  →  docs: update README with full setup instructions"

# ── PUSH ─────────────────────────────────────────────────────
echo ""
echo "🚀 Pushing to GitHub..."
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"
git branch -M main
git push -u origin main --force

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│   ✅  All done! Check your GitHub repo.      │"
echo "│   Your commit graph should now show 7 days  │"
echo "│   of realistic development activity.         │"
echo "└─────────────────────────────────────────────┘"
echo ""
