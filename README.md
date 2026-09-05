# ⚔️ Sudoku Battle 1v1 [app link](https://expo.dev/accounts/karthikpaila/projects/riskview/builds/feb3d11d-7482-476b-b271-0a02084952fb)

<p align="center">
  <strong>A real-time, head-to-head Sudoku experience built for fast thinkers.</strong><br />
  Solve the same puzzle, race the clock, and climb the leaderboard.
</p>

<p align="center">
  <a href="#-quick-start">Quick start</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-configuration">Configuration</a> ·
  <a href="#-project-structure">Structure</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/release-v1.0.0-7C3AED?style=flat-square" alt="Release v1.0.0" />
  <img src="https://img.shields.io/badge/client-Expo%20%2B%20React%20Native-111827?style=flat-square&logo=expo" alt="Expo and React Native" />
  <img src="https://img.shields.io/badge/API-NestJS-E0234E?style=flat-square&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/database-PostgreSQL-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
</p>

---

## ✨ Overview

**Sudoku Battle 1v1** is a mobile-first Sudoku platform where players sign in, solve daily challenges, connect with friends, and compete in live one-versus-one matches. The client delivers a polished Expo/React Native experience; the backend manages authentication, puzzles, matchmaking, live game state, ratings, and leaderboards.

## 🎯 Features

| Area | What’s included |
| --- | --- |
| 🔐 **Account & profile** | Google Sign-In, token refresh, secure local token storage, and profile setup. |
| 🧩 **Sudoku gameplay** | Random puzzles with 2×3 and 3×3 variants, timer support, validation, and a touch-friendly number pad. |
| ⚔️ **Live battles** | Socket.IO matchmaking, invitations, synchronized moves, presence checks, battle results, and reconnect support. |
| 📈 **Competitive play** | Per-variant ratings, recent games, match history, and leaderboards. |
| 📅 **Daily challenge** | One daily puzzle per variant, attempt submission, timing, and daily leaderboards. |
| 👥 **Social layer** | User search, friend requests, friend lists, and direct battle invitations. |
| 🛡️ **Backend safeguards** | JWT-protected routes, request validation, rate limiting, Helmet, CORS, Prisma migrations, and Redis-backed Socket.IO. |

## 🧱 Tech stack

| Layer | Technologies |
| --- | --- |
| Mobile client | Expo 57, React Native, Expo Router, TypeScript, Redux Toolkit, React Native Unistyles |
| API | NestJS 11, TypeScript, Swagger, class-validator, JWT |
| Real-time | Socket.IO with the Redis adapter |
| Data | PostgreSQL, Prisma 7, Redis |
| Authentication | Google Identity, access tokens, rotating refresh tokens |

## 📁 Project structure

```text
Sudoku-Battle-1v1/
├── client/                 # Expo / React Native app
│   ├── src/app/            # File-based routes and screens
│   ├── src/components/     # Reusable UI and game components
│   ├── src/features/       # Redux feature modules
│   ├── src/services/       # REST, Google auth, and Socket.IO clients
│   └── assets/             # App icons and images
├── server/                 # NestJS API and real-time server
│   ├── src/auth/           # Google login, JWT, refresh sessions
│   ├── src/battles/        # Matchmaking, invitations, battle state
│   ├── src/daily/          # Daily challenges and leaderboard
│   ├── src/friends/        # Social graph and friend requests
│   ├── src/sudoku/         # Puzzle access and variants
│   ├── prisma/             # Schema, migrations, and seed script
│   └── src/redis/          # Redis client and Socket.IO adapter
└── README.md
```

## ✅ Prerequisites

Before you begin, install or have access to:

- [Node.js](https://nodejs.org/) 20 LTS or newer and npm
- PostgreSQL 14+ (local or hosted)
- Redis 6+ (local or hosted)
- A Google OAuth client ID for Google Sign-In
- Expo Go on a physical device, or an Android/iOS simulator

> **Tip:** Docker is a convenient way to run PostgreSQL and Redis locally if you do not already have them installed.

## 🚀 Quick start

### 1. Clone and install dependencies

```bash
git clone https://github.com/PailaKarthik/Sudoku-Battle-1v1.git
cd Sudoku-Battle-1v1

cd server
npm install

cd ../client
npm install
```

### 2. Configure the server

Create `server/.env` from the example:

```bash
cd ../server
cp .env.example .env
```

On PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Then update `server/.env` with your own values:

```dotenv
# PostgreSQL database used by Prisma
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sudoku?schema=public"

# Redis is required for the app and real-time Socket.IO adapter
REDIS_URL="redis://localhost:6379"

# API port
PORT=3000

# Google OAuth web client ID; this validates the ID token sent by the app
GOOGLE_CLIENT_ID="your-google-web-client-id.apps.googleusercontent.com"

# Use a long, unique, secret value in every environment
JWT_REFRESH_SECRET="replace-with-a-long-random-secret"
```

> Never commit `.env` files or real credentials. The repository ignores them by default.

### 3. Create the database schema

With PostgreSQL and Redis running, create the schema and generate the Prisma client:

```bash
npm run prisma:migrate
npm run prisma:generate
```

Optional: seed the database when you want local starter data.

```bash
npm run prisma:seed
```

### 4. Start the backend

```bash
npm run start:dev
```

The API starts at `http://localhost:3000`, with the REST prefix `/api`.

- Health check: `http://localhost:3000/api/health`
- Swagger API docs: `http://localhost:3000/api/docs`

### 5. Configure and start the mobile app

Create `client/.env`:

```dotenv
# REST API, including the /api prefix
EXPO_PUBLIC_API_URL="http://localhost:3000/api"

# Socket.IO server, without the /api prefix
EXPO_PUBLIC_SOCKET_URL="http://localhost:3000"

# Google OAuth web client ID used by the client
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID="your-google-web-client-id.apps.googleusercontent.com"
```

Then start Expo:

```bash
cd ../client
npm run start
```

Use the Expo terminal to open the app in Expo Go, an emulator, or a web browser.

### Running on a physical device

`localhost` points to the phone itself, not your computer. Replace it with your computer’s LAN address in `client/.env`, then restart Expo:

```dotenv
EXPO_PUBLIC_API_URL="http://192.168.1.50:3000/api"
EXPO_PUBLIC_SOCKET_URL="http://192.168.1.50:3000"
```

Make sure the phone and computer are on the same network, and that the backend port is allowed through your firewall.

## ⚙️ Configuration

### Server variables

| Variable | Required | Purpose |
| --- | :---: | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `REDIS_URL` | Yes | Redis connection used by app services and live Socket.IO scaling. |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID accepted by the backend. |
| `JWT_REFRESH_SECRET` | Yes | Secret used to sign and verify refresh tokens. |
| `PORT` | No | HTTP port; defaults to `3000`. |

### Client variables

| Variable | Required | Purpose |
| --- | :---: | --- |
| `EXPO_PUBLIC_API_URL` | Recommended | Backend REST base URL. Defaults to `http://localhost:3000/api`. |
| `EXPO_PUBLIC_SOCKET_URL` | Recommended | Socket.IO server URL. Defaults to `http://localhost:3000`. |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Yes | Google OAuth client ID used for app sign-in. |

## 🛠️ Available commands

### Client — `client/`

| Command | Description |
| --- | --- |
| `npm run start` | Start Expo’s development server. |
| `npm run android` | Build and run on Android. |
| `npm run ios` | Build and run on iOS (macOS required). |
| `npm run web` | Run the web build locally. |
| `npm run lint` | Lint the Expo project. |

### Server — `server/`

| Command | Description |
| --- | --- |
| `npm run start:dev` | Start NestJS in watch mode. |
| `npm run build` | Build the production server. |
| `npm run start:prod` | Run the production build. |
| `npm run test` | Run unit tests. |
| `npm run prisma:migrate` | Create/apply development migrations. |
| `npm run prisma:migrate:deploy` | Apply committed migrations for deployment. |
| `npm run prisma:generate` | Generate the Prisma client. |
| `npm run prisma:seed` | Seed the database. |
| `npm run prisma:studio` | Open Prisma Studio. |

## 🔌 API and real-time services

All HTTP endpoints live beneath `/api`. Most routes require a Bearer access token; the health endpoint is public.

| Service | Route / namespace | Notes |
| --- | --- | --- |
| API documentation | `/api/docs` | Swagger UI generated by NestJS. |
| Health | `GET /api/health` | Public health check. |
| Authentication | `/api/auth` | Google sign-in, refresh, logout, and current user. |
| Sudoku | `/api/sudoku` | Random and individual puzzle retrieval. |
| Daily challenge | `/api/daily` | Current challenge, submission, and leaderboard. |
| Battles | `/api/battles` | Create games, invitations, recent games, and results. |
| Live battle socket | `/battle` | Matchmaking, move events, presence, and game updates. |

## 🗄️ Data model at a glance

PostgreSQL holds users, OAuth sessions, friend requests, friendships, puzzles, daily challenges, attempts, ratings, battles, battle players, and invitations. Redis supports shared real-time state and the Socket.IO adapter.

```text
Expo client ── REST / Socket.IO ── NestJS API
                                      ├── PostgreSQL + Prisma
                                      └── Redis + Socket.IO adapter
```

## 🔒 Security notes

- Keep `JWT_REFRESH_SECRET`, database credentials, Redis credentials, and Google client IDs in environment configuration—not source control.
- Use HTTPS/WSS, restrictive CORS rules, and managed PostgreSQL/Redis credentials in production.
- The API applies validation, Helmet, JWT protection, and rate limiting; production deployments should still be monitored and backed up.

## 🧭 Release

The current source snapshot is tagged [`v1.0.0`](https://github.com/PailaKarthik/Sudoku-Battle-1v1/releases/tag/v1.0.0).

---

Built for players who enjoy thinking under pressure. 🧠
