# Focus — Minimalist Digital Workspace

> One clean tab. Every workflow.
> Kanban tasks, saved links, a focus timer, and quick notes — organized on a single, quiet white canvas.

![Made with Lovable](https://img.shields.io/badge/Made%20with-Lovable-000?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)
![TanStack Start](https://img.shields.io/badge/TanStack-Start-FF4154?style=flat-square)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)

---

## ✨ Why

Modern work is fragmented across dozens of tabs — links, todo apps, note apps,
music, timers. **Focus** consolidates the essentials into a single, calm
workspace so you can stop context-switching and start doing.

## 🧩 Features

| Module | What it does |
| ------ | ------------ |
| 📋 **Kanban** | Three columns (To do · Doing · Done) with native drag-and-drop |
| 🔗 **Links** | Save any URL as a visual card with favicon + domain |
| ⏱️ **Focus Timer** | 25 / 5 Pomodoro with animated ring and desktop notifications |
| 🎧 **Ambient Audio** | Built-in Rain · Lo-Fi · Forest loops |
| 📝 **Notes** | Quick scratchpad for fleeting thoughts |

All data is persisted locally in your browser (`localStorage`) — no account, no
server, no tracking.

## 🎨 Design

- Pure **white background** (`#ffffff`) with a quiet neutral palette
- **Inter** for UI, **Instrument Serif** for display headlines
- Enterprise-grade minimal aesthetic — zero visual noise

## 🛠️ Tech Stack

- **TanStack Start v1** (React 19 + Vite 7, SSR-ready)
- **Tailwind CSS v4** (CSS-first `@theme` tokens in `src/styles.css`)
- **TanStack Router** file-based routing (`src/routes/`)
- **lucide-react** icons
- Deployable on any edge platform (Cloudflare Workers by default)

## 🚀 Getting Started

```bash
# Install dependencies
bun install     # or: npm install / pnpm install

# Start the dev server
bun run dev     # http://localhost:8080

# Build for production
bun run build
```

## 📁 Project Structure

```
src/
├── routes/
│   ├── __root.tsx          # Root layout, <head>, fonts
│   └── index.tsx           # Home route
├── components/
│   ├── workspace/
│   │   └── Workspace.tsx   # Kanban · Links · Focus · Notes
│   └── ui/                 # shadcn primitives
├── styles.css              # Tailwind v4 tokens & design system
└── router.tsx              # TanStack Router setup
```

## 🔄 Editing this project

You can edit this project in three ways:

1. **In Lovable** — open the project and chat with the AI. Changes push to
   GitHub automatically.
2. **Locally** — clone this repo, edit in your IDE, `git push`. Changes sync
   back into Lovable in real time.
3. **On GitHub** — edit files directly in the GitHub web UI.

## 📦 Deployment

Publish instantly from Lovable (**Share → Publish**), or deploy the built
output from `bun run build` to any static/edge host (Vercel, Cloudflare Pages,
Netlify).

## 📄 License

MIT — do whatever you like.

---

<p align="center">Built with 🤍 on <a href="https://lovable.dev">Lovable</a>.</p>
