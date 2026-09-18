# 🕊️ Hermes Console - Admin Dashboard

> 🇧🇷 **Versão em Português?** [README.md](README.md)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)

**Modern admin dashboard for the Hermes Transactional Email Gateway ecosystem.**

[API Backend](https://github.com/RuanLopes1350/hermes-api) • [Hermes Client (NPM)](https://github.com/RuanLopes1350/hermes-client)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#️-prerequisites)
- [Environment Variables](#-environment-variables)
- [Running Locally](#️-running-locally)
- [Available Scripts](#-available-scripts)
- [Project Structure](#️-project-structure)
- [API Communication](#-api-communication)

---

## 🎯 About the Project

**hermes-front** is the administrative dashboard for the **Hermes** ecosystem. Built with **Next.js 16.2 (App Router)**, it allows administrators and developers to fully manage their transactional email infrastructure through an intuitive, responsive, and real-time dashboard.

---

## 🌟 Key Features

- **Multi-Tenant Service Management:** Isolate configurations (API keys, templates, logs) in separate namespaces ("Services").
- **Real-Time Analytics Dashboard:** Visualize delivery statistics (delivered, failed, pending) via **ECharts** charts updated over Server-Sent Events.
- **SMTP Credential Management:** Add traditional SMTP credentials (password/App Password) or authorize accounts using the **Google OAuth2** flow directly from the dashboard.
- **Secure API Keys:** Create, view, and manage API Keys for integrated projects.
- **MJML Template Editor:** Build responsive emails using the integrated **Monaco Editor** with a live iframe preview.
- **Real-Time Logs & Audit:** Track the status of every message (pending, sent, retrying, failed) via SSE.

---

## 🚀 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2 | React framework (App Router) |
| **React** | 19 | UI library |
| **TypeScript** | 5.9 | Static typing |
| **Tailwind CSS** | v4 | Utility-first styling |
| **shadcn/ui + Radix UI** | - | Accessible UI components |
| **ECharts** | 6.x | Analytics charts |
| **Monaco Editor** | 4.7 | MJML template editor |
| **Better Auth** | 1.6 | Authentication (shared with the API) |
| **TanStack Query** | 5.x | Async state management |
| **hermes-client** | 1.2.2 | SDK for the Hermes API |

---

## ⚙️ Prerequisites

The frontend requires the **hermes-api** to be running (locally on port `3001` or on a remote server). See the [API README](https://github.com/RuanLopes1350/hermes-api) for setup instructions.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Hermes API base URL (required)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Public URL where this frontend is served (required for SEO/OpenGraph)
# In production, use the real domain (e.g., https://app.yourdomain.com)
# Note: NEXT_PUBLIC_* variables are embedded into the bundle at build time.
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Important:** Make sure the frontend URL (`NEXT_PUBLIC_APP_URL`) is listed in `AUTH_TRUSTED_ORIGINS` in the `hermes-api` `.env` file.

---

## 🛠️ Running Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
# Edit .env with the correct values
```

### 3. Start the development server
```bash
npm run dev
```

### 4. Access the dashboard
Open [http://localhost:3000](http://localhost:3000) in your browser. Log in with the credentials defined by `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the API's `.env` file.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Generate the production build |
| `npm run start` | Start the production server (requires build) |
| `npm run lint` | Run ESLint |
| `npm run format:fix` | Format code with Prettier |
| `npm run format:check` | Check formatting without modifying files |

---

## 🗂️ Project Structure

```
hermes-front/src/
├── app/                        # Pages and layouts (Next.js App Router)
│   ├── (auth)/                 # Public authentication routes (login)
│   └── (system)/               # Protected admin dashboard routes
├── components/                 # UI Design System (shadcn/Radix/Tailwind)
├── constants/                  # Global application constants
├── hooks/                      # Custom React hooks (e.g., useSSE)
├── lib/
│   ├── api.ts                  # HTTP client for the Hermes API
│   └── auth-client.ts          # Better Auth configuration (client-side)
├── middleware.ts               # Next.js middleware (route protection)
└── types/                      # Frontend TypeScript types
```

---

## 🔗 API Communication

The frontend communicates with the `hermes-api` in two ways:

1. **Session (Better Auth):** For admin dashboard access, it uses Better Auth sessions via HTTPOnly cookies or a Bearer Token in the `Authorization` header.
2. **`hermes-client` SDK:** The dashboard uses the `@ruanlopes1350/hermes-client` SDK (v1.2.2) for email sending operations originated from the frontend context.

---

Developed by [Ruan Lopes](https://github.com/RuanLopes1350). ISC License.
