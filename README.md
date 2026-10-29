# MyApp — Project Documentation

> Built by **Antigravity** (Claude Opus 4.6) for Galaxy on 29 Oct 2026.

---

## Overview

A static single-page web app with a matte black UI inspired by ChatGPT / Perplexity. It features a sidebar, a centered chat prompt, and a settings page — all built with vanilla HTML, CSS, and JS (no frameworks).

---

## File Structure

```
website/
├── index.html    ← Main HTML (all pages live here, swapped via JS)
├── style.css     ← All styles (theme variables, sidebar, pages, toggle, API card)
├── script.js     ← All logic (page nav, theme toggle, API key management)
└── README.md     ← This file
```

---

## Features Built

### 1. Sidebar
- Fixed left panel, dark (`#0a0a0a`)
- **Chats** at the top with a chat bubble icon
- **Settings** and **Account** at the bottom with gear and person icons
- All items use inline SVGs (Feather/Lucide style)
- Clicking any item swaps the main content area (SPA-style navigation)

### 2. Chat Page (default)
- Centered prompt box with heading: *"What can I help you with?"*
- Rounded input field with a white send button (arrow icon)
- Matte black background (`#111`)

### 3. Settings Page
- **Appearance toggle** — Day/Night switch with:
  - Moon icon (dark mode, knob left)
  - Sun icon (light mode, knob right, yellow knob on sky-blue track)
  - Smooth sliding animation
  - Entire site theme changes (sidebar, background, inputs, text — everything)
  - Theme preference saved to `localStorage`

- **AI API Key** — Connect any AI provider:
  - Dropdown: OpenAI, Anthropic, Google Gemini, Mistral, Cohere, Groq, Perplexity
  - Password input field (masked)
  - Save button — stores key per provider in `localStorage`
  - Switching providers loads any previously saved key
  - Status message confirms save

### 4. Account Page
- Placeholder — just a heading, ready to be built out

---

## Theme System

Uses CSS custom properties on `:root[data-theme="dark"]` and `:root[data-theme="light"]`. All colors reference `var(--*)` tokens, so adding new components automatically follows the theme.

Key variables: `--bg`, `--sidebar-bg`, `--text`, `--text-muted`, `--input-bg`, `--input-border`, `--settings-card-bg`, etc.

---

## Git History

| Commit | Message |
|--------|---------|
| `8913af5` | Initial commit: static page with sidebar and prompt box |
| `66350e2` | Add settings page with day/night toggle and page navigation |
| `1170810` | Extract CSS/JS to separate files, add AI API key settings |
| `8e76436` | Fix: use external CSS/JS files, add API key settings to settings page |
| `2b66550` | Fix: restore script.js content |

---

## How to Run

```bash
cd website
python3 -m http.server 8080
```

Then open **http://localhost:8080** in your browser.

---

## What's Next (ideas for the next agent)

- Wire up the chat prompt to actually call the saved AI API key
- Add chat message bubbles (user + AI responses)
- Build out the Account page (profile, sign in/out)
- Add more settings (model selection, temperature, system prompt)
- Make it responsive for mobile
- Deploy to GitHub Pages / Netlify / Vercel
