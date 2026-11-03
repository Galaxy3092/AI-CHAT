# TextBot — AI Chat Engine

> A lightweight, static AI chat web application with automatic live model fetching, optional API keys, and real-time response metrics. Built with vanilla HTML, CSS, and JS (zero frameworks).

---

## File Structure

```
textbot/
├── index.html    ← Main application HTML (SPA structure)
├── style.css     ← Modern theme tokens, ChatGPT/Perplexity layout, dark/light modes
├── script.js     ← Auto-fetching model engine, multi-provider router, live metrics
└── README.md     ← Documentation & usage guide
```

---

## Key Features

### 1. Automatic Live Model Fetching (No Manual Typing)
- **Zero Manual Entry**: The application automatically connects to the selected provider/server endpoint in the background, fetches the live list of models, and populates the dropdowns for you.
- **Auto-Selection**: The first available model is selected automatically, ready for immediate chatting.
- **In Chat Header**: Model selector dropdown pinned at the top of the chat area allows instant model switching.
- **Dynamic Background Updates**: Automatically re-fetches when you change providers or paste an API key.

### 2. Optional API Keys & Local Models
- **Keyless / Local Mode**: Fully supports local inference servers like **Ollama** (`http://localhost:11434/v1`), **LM Studio** (`http://localhost:1234/v1`), LocalAI, or open proxies without needing an API key.
- **Hosted Cloud Providers**: Supports **Google Gemini**, **OpenRouter**, **Groq**, **OpenAI**, **Anthropic**, **Mistral**, **Cohere**, and **Perplexity** whenever you provide a key.

### 3. Zero Pre-Assumptions & Honest Live Metrics
- **No Fake Numbers**: Removed all static rate tables and pre-assumed RPM/TPM numbers.
- **Real-Time Response Metrics**:
  - Live round-trip response time in milliseconds (<kbd>ms</kbd>).
  - Actual tokens returned from response payloads.
  - Active model and service name.

### 4. ChatGPT / Perplexity Style Chat
- **Top Header Bar**: Shows active model with live status indicator.
- **Incognito / Temporary Chat**: Dedicated incognito mode button in the header (`🕶️ Incognito`) that disables all storage and sidebar saving for private, ephemeral sessions.
- **Sidebar Saved Chats**: Full conversation history in the left sidebar with auto-generated session titles, active highlight, one-click switching, and individual session deletion.
- **Bottom Copy Buttons**: Clean action bar at the bottom of every question and response with instant visual feedback (`Copied!`).
- **New Chat Buttons**: Start a fresh conversation instantly from either the left sidebar or the top header.
- **Markdown & Code Rendering**: Formatted code blocks, bold, italics, lists, and avatars.
- **Auto-expanding Textarea**: Grows dynamically with multiline input; <kbd>Enter</kbd> sends and <kbd>Shift</kbd>+<kbd>Enter</kbd> inserts a newline.

---

## How to Run

```bash
cd textbot
python3 -m http.server 8080
```

Then open **http://localhost:8080** in your browser.
