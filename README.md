# MyApp — Project Documentation

> An AI assistant web application with a ChatGPT / Perplexity-style interface, dynamic model selection, live API connection metrics, and multi-provider AI support. Built with vanilla HTML, CSS, and JS (zero frameworks).

---

## File Structure

```
website/
├── index.html    ← Main application HTML (SPA page structure)
├── style.css     ← Modern theme tokens, ChatGPT/Perplexity layout, animations, badges
├── script.js     ← SPA navigation, live API calls, dynamic model menus, real-time metrics
└── README.md     ← Documentation & usage guide
```

---

## Key Features

### 1. Model Selection Menu
- **In Chat Header**: Interactive model dropdown directly at the top of the chat area (like ChatGPT / Perplexity). Easily switch between models on the fly.
- **In Settings**: Dropdown with curated models per provider, custom model ID input, and a **"Fetch Live Models"** button that queries the provider's API directly for your key's accessible models.
- **Dynamic Routing**: The chosen model is stored per provider and passed to each API request.

### 2. Live Honest Metrics (Zero Pre-Assumed Stats)
- **No Hardcoded Numbers**: Removed all fake/pre-assumed RPM, TPM, and daily quota tables.
- **Query the Key Directly**:
  - For Google Gemini: queries `https://generativelanguage.googleapis.com/v1beta/models?key=...` to verify the key and list accessible models.
  - For OpenRouter: queries `https://openrouter.ai/api/v1/auth/key` to fetch live account usage, limits, and rate limits.
  - For Groq / OpenAI: queries `/v1/models` for active account status.
- **Real-Time Session Metrics**: Tracks actual latency (<kbd>ms</kbd>) and tokens returned directly from API responses (`usageMetadata` / `usage`).

### 3. Key Cleanup & Security
- **Clear All Keys**: One-click **"Clear All Keys"** button in Settings to completely wipe invalid or stale keys from `localStorage` and start fresh.
- **Remove Single Key**: Remove key for any individual provider.
- **Password Visibility Toggle**: Inspect pasted keys to verify there are no hidden whitespaces.

### 4. Chat Interface
- **Top Header Bar**: Displays the active provider and model with a live status indicator.
- **Suggestion Chips**: Prompt ideas on the welcome screen to kick off conversations with one click.
- **"New Chat" Button**: Clears the conversation history and resets the view.
- **Markdown & Code Rendering**: User and AI message bubbles with syntax-highlighted code blocks, bold, italics, and avatars.
- **Auto-expanding Input**: Textarea grows dynamically with multiline input; <kbd>Enter</kbd> sends and <kbd>Shift</kbd>+<kbd>Enter</kbd> inserts a newline.

---

## How to Run

```bash
cd website
python3 -m http.server 8080
```

Then open **http://localhost:8080** in your browser.
