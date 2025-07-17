# 💬 Fun Chat

**Fun Chat** is a real-time single-page chat application where messages never get lost, and every click is yours to control. Built with WebSockets, strict TypeScript rules, and a modular architecture, this project puts privacy, responsiveness, and usability first — all in your own hands.

🌐 [Live Demo](https://tatsianakuryla.github.io/fun-chat/)
🖥️ [Server](https://fun-chat-server-3m8s.onrender.com)

---

## 📚 Table of Contents

- [📦 Project Overview](#-project-overview)
- [🚀 Live Demo](#-live-demo)
- [✨ Features](#-features)
- [🧩 Project Structure](#-project-structure)
- [🔧 Scripts & Setup](#-scripts--setup)
- [⚙️ Technologies Used](#-technologies-used)

---

## 📦 Project Overview

Fun Chat is a full-featured messaging SPA that uses WebSockets for real-time interaction. It includes user authentication, private messaging, status indicators, read receipts, message editing and deletion, and full offline handling. This app was built as part of the Rolling Scopes School curriculum to master advanced DOM, async programming, and WebSocket API.

---

## 🚀 Live Demo

🌐 [Live Demo](https://tatsianakuryla.github.io/fun-chat/)

🧩 Requires server connection:
🔌 [Server](https://fun-chat-server-3m8s.onrender.com)

---

## ✨ Features

### 🔐 Authentication
- Form validation for login and password
- Server-side validation with error messaging
- Access control by auth status
- Keyboard-based form submission

### 💬 Messaging
- Private messages with:
  - Status indicators: Sent, Delivered, Read
  - Edit/Delete your own messages
  - Dividers for unread messages
  - Scroll to latest on send/receive
- Disable input when no recipient is selected

### 👥 Users & Presence
- Online/offline status
- Search users
- Unread message counter per user

### 🧭 Navigation
- Protected routes for auth/non-auth users
- Unique URLs for every page
- Full browser navigation support (Back/Forward)

### 🌐 Connectivity
- Persistent WebSocket connection
- Reconnect handling with auto-auth
- Offline message handling

### 🎨 Interface
- Responsive design (380px – 1440px)
- About page (available for all users)
- Theme-consistent icons, hover states, favicon
- Footer with school, author and GitHub info

---

## 🧩 Project Structure

```aiignore
fun-chat/
├── public/
├── src/
│ ├── api/
│ ├── assets/
│ ├── core/
│ ├── styles/
│ ├── ui/
│ │ ├── components/
│ │ ├── layouts/
│ │ └── pages/
│ ├── utils/
│ ├── index.html
│ ├── index.ts
│ └── types.ts

```

---

## 🔧 Scripts & Setup

```bash
  # Install dependencies
npm install
```
```bash
  # Start development server
npm run start
```
```bash
  # Run code formatter
npm run format
```
```bash
  # Lint JavaScript/TypeScript
npm run lint
npm run lint:fix
```
```bash
  # Lint styles
npm run stylelint
```
```bash
  # Build for production
npm run build
```
```bash
  # Deploy to GitHub Pages
npm run deploy
```
---
### ⚙️ Technologies Used
 - TypeScript
 - Webpack
 - WebSocket API
 - ESLint + Prettier + Husky
 - DOM API (no frameworks)
 - Responsive HTML/CSS


