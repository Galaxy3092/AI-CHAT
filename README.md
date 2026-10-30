# MyApp — AI Chat Engine

> A lightweight, static AI chat web application with zero pre-assumed models, optional API keys, and real-time response metrics. Built with vanilla HTML, CSS, and JS (zero frameworks).

---

## File Structure

```
website/
├── index.html    ← Main application HTML (SPA structure)
├── style.css     ← Modern theme tokens, ChatGPT/Perplexity layout, dark/light modes
├── script.js     ← Multi-provider router, zero-assumption model engine, live metrics
└── README.md     ← Documentation & usage guide
```

---

## Design Principles

### 1. Bring Your Own Model (Empty by Default)
- **No Hardcoded Models**: The application does not assume or hardcode any default models. You can bring any model you want.
- **Type Any Model Directly**: Enter your model identifier directly in the Chat header input or in Settings (e.g. `llama3`, `gemini-1.5-flash`, `gpt-4o`, `deepseek-r1`, or custom fine-tunes).
- **Fetch Live Models (Optional)**: If you connect an API key or local endpoint, clicking **"Fetch Models from API"** asks the server directly for the live model list permitted on your account.

### 2. API Keys are 100% Optional
- **Keyless / Local Mode**: Works without an API key for local inference servers like **Ollama** (`http://localhost:11434/v1`), **LM Studio** (`http://localhost:1234/v1`), LocalAI, or open proxies.
- **Hosted Cloud Providers**: Supports **Google Gemini**, **OpenRouter**, **Groq**, **OpenAI**, **Anthropic**, **Mistral**, **Cohere**, and **Perplexity** whenever you provide a key.

### 3. Zero Pre-Assumed Stats
- **No Fake Rate Tables**: Removed all static/pre-assumed RPM, TPM, and quota tables.
- **Live Response Metrics**:
  - Round-trip latency in milliseconds (<kbd>ms</kbd>).
  - Tokens returned directly from actual API response payloads.
  - Live server connection confirmation.

### 4. Chat Interface
- **Top Header Bar**: Type or switch your model directly at the top of the chat.
- **Welcome Screen**: Clean interface with quick prompt ideas.
- **"New Chat" Button**: Clears the conversation history and resets the view.
- **Markdown & Code Rendering**: Message bubbles with formatted code blocks, bold, italics, and avatars.
- **Auto-expanding Input**: Textarea grows dynamically with multiline input; <kbd>Enter</kbd> sends and <kbd>Shift</kbd>+<kbd>Enter</kbd> inserts a newline.

---

## How to Run

```bash
cd website
python3 -m http.server 8080
```

Then open **http://localhost:8080** in your browser.
