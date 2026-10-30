# MyApp — Project Documentation

> An AI assistant web application with ChatGPT / Perplexity-style interface, multi-provider API support, live connection status indicators, and rate limits tracking. Built with vanilla HTML, CSS, and JS (zero frameworks).

---

## File Structure

```
website/
├── index.html    ← Main application HTML (SPA page structure)
├── style.css     ← Modern theme tokens, ChatGPT/Perplexity layout, animations, badges
├── script.js     ← SPA navigation, live API calls, connection test, status detection
└── README.md     ← Documentation & usage guide
```

---

## Key Features

### 1. Chat Experience (ChatGPT & Perplexity Inspired)
- **Top Header Bar**: Shows the currently active AI provider (e.g. `🟢 Google Gemini`) with connection status badge. Clicking it navigates straight to Settings to manage keys.
- **New Chat Button**: Clears the conversation history and resets to the welcome screen.
- **Welcome Screen**: Clean typography with quick-start suggestion chips (*"Explain quantum computing"*, *"Write a clean Python REST script"*, etc.).
- **Message Bubbles**: Styled user and assistant message rows with avatars, role labels, model tags, and formatted Markdown rendering (code blocks, bold, italics, paragraphs).
- **Typing Indicator**: Animated 3-dot bounce indicating active response generation.
- **Auto-expanding Input**: Textarea grows dynamically with multiline input; <kbd>Enter</kbd> sends and <kbd>Shift</kbd>+<kbd>Enter</kbd> inserts a newline.

### 2. Multi-Provider AI API Integration
Direct browser-to-API calls with error handling:
- **Google Gemini** (Recommended free tier): `gemini-1.5-flash` with full multi-turn conversation support.
- **OpenRouter**: Unified access across free and premium models.
- **Groq**: Ultra-fast Llama 3.1 8B inference.
- **OpenAI**: GPT-3.5 Turbo.
- **Anthropic**: Claude 3 Haiku with direct browser access header.
- **Mistral**: Mistral Small.
- **Cohere**: Command-R.
- **Perplexity**: Sonar.

### 3. API Key & Connection Detection
- **Live Connection Status Box**: Bold, animated status card with a pulsing green dot when connected or red dot when offline.
- **One-Click Connection Test**: **"Test Connection"** button verifies your API key against the provider's official servers before you start chatting.
- **Key Visibility Toggle**: Eye icon to inspect/hide pasted keys.
- **Detected Keys Quick-Switcher**: Lists all providers that have keys saved on your browser; click any detected provider to set it as active immediately.
- **Sidebar Status Indicator**: Mini status dot and provider name pinned to the bottom of the sidebar.

### 4. Rate Limits Reference
Comprehensive rate limit reference table comparing RPM, TPM, and daily limits across all 8 providers (focusing on free tier offerings).

### 5. Theme System
Clean CSS custom property system supporting instant Day/Night toggling with smooth transitions and persistent `localStorage` preference.

---

## How to Run

```bash
cd website
python3 -m http.server 8080
```

Then open **http://localhost:8080** in your browser.
