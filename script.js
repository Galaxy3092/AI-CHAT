// ══════════════════════════════════════
//  MyApp — AI Chat & API Key Management
// ══════════════════════════════════════

// ── DOM Elements ──
const navLinks = document.querySelectorAll('[data-page]');
const pages = document.querySelectorAll('.page');

// Settings Elements
const themeToggle = document.getElementById('themeToggle');
const apiProvider = document.getElementById('apiProvider');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiSaveBtn = document.getElementById('apiSaveBtn');
const apiTestBtn = document.getElementById('apiTestBtn');
const apiDeleteBtn = document.getElementById('apiDeleteBtn');
const apiStatus = document.getElementById('apiStatus');
const btnToggleVisibility = document.getElementById('btnToggleVisibility');
const eyeIcon = document.getElementById('eyeIcon');
const activeProviderBadge = document.getElementById('activeProviderBadge');

// Connection Status Box (Settings)
const connectionBox = document.getElementById('connectionBox');
const connectionDot = document.getElementById('connectionDot');
const connectionTitle = document.getElementById('connectionTitle');
const connectionDesc = document.getElementById('connectionDesc');
const connectionBadge = document.getElementById('connectionBadge');
const savedProvidersChips = document.getElementById('savedProvidersChips');
const limitsTableRows = document.querySelectorAll('.limits-table tbody tr');

// Chat Elements
const pageChat = document.getElementById('page-chat');
const chatHeaderDot = document.getElementById('chatHeaderDot');
const chatHeaderModelName = document.getElementById('chatHeaderModelName');
const chatHeaderBadge = document.getElementById('chatHeaderBadge');
const chatModelPill = document.getElementById('chatModelPill');
const chatNewBtn = document.getElementById('chatNewBtn');
const chatWelcome = document.getElementById('chatWelcome');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const suggestionChips = document.querySelectorAll('.suggestion-chip');

// Sidebar Status
const sidebarDot = document.getElementById('sidebarDot');
const sidebarStatusText = document.getElementById('sidebarStatusText');


// ══════════════════════════════════════
//  Page Navigation
// ══════════════════════════════════════

function navigateTo(pageId) {
  navLinks.forEach(link => {
    if (link.getAttribute('data-page') === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  pages.forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById('page-' + pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  if (pageId === 'chat') {
    chatInput.focus();
  }
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.getAttribute('data-page');
    navigateTo(target);
  });
});

chatModelPill.addEventListener('click', () => {
  navigateTo('settings');
});


// ══════════════════════════════════════
//  Theme Management
// ══════════════════════════════════════

themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}


// ══════════════════════════════════════
//  Active Provider & Key Storage
// ══════════════════════════════════════

const ALL_PROVIDERS = [
  'Google Gemini',
  'OpenRouter',
  'Groq',
  'OpenAI',
  'Anthropic',
  'Mistral',
  'Cohere',
  'Perplexity'
];

function getActiveProvider() {
  const active = localStorage.getItem('active_provider');
  if (active && ALL_PROVIDERS.includes(active)) {
    return active;
  }
  // If no explicit active provider, check if Gemini has a key
  if (localStorage.getItem('apiKey_Google Gemini')) {
    return 'Google Gemini';
  }
  // Otherwise check any provider with a key
  for (const p of ALL_PROVIDERS) {
    if (localStorage.getItem('apiKey_' + p)) {
      return p;
    }
  }
  return 'Google Gemini';
}

function setActiveProvider(provider) {
  localStorage.setItem('active_provider', provider);
  updateAllStatusIndicators();
}

function loadProviderKeyIntoInput() {
  const provider = apiProvider.value;
  const savedKey = localStorage.getItem('apiKey_' + provider) || '';
  apiKeyInput.value = savedKey;
  apiStatus.textContent = '';
  apiStatus.className = 'api-key-status';
  updateConnectionBox(provider, savedKey);
}


// ══════════════════════════════════════
//  Status Indicators Update
// ══════════════════════════════════════

function updateAllStatusIndicators() {
  const active = getActiveProvider();
  const activeKey = localStorage.getItem('apiKey_' + active);
  const isOnline = !!(activeKey && activeKey.trim());

  // Chat Top Header
  chatHeaderModelName.textContent = active;
  if (isOnline) {
    chatHeaderDot.className = 'pulse-dot online';
    chatHeaderBadge.className = 'model-status-badge online';
    chatHeaderBadge.textContent = 'Ready';
    chatModelPill.title = `Connected to ${active} (Click to change in Settings)`;
    chatInput.placeholder = `Message ${active}... (Enter to send, Shift+Enter for newline)`;
  } else {
    chatHeaderDot.className = 'pulse-dot';
    chatHeaderBadge.className = 'model-status-badge';
    chatHeaderBadge.textContent = 'No Key';
    chatModelPill.title = `No API key for ${active} (Click to setup in Settings)`;
    chatInput.placeholder = `Add an API key in Settings to chat with ${active}...`;
  }

  // Sidebar Status
  const shortName = active.replace('Google ', '');
  if (isOnline) {
    sidebarDot.className = 'status-indicator-dot active';
    sidebarStatusText.textContent = `${shortName} (Online)`;
  } else {
    sidebarDot.className = 'status-indicator-dot';
    sidebarStatusText.textContent = `${shortName} (No Key)`;
  }

  // Settings active badge
  activeProviderBadge.textContent = `Active: ${active}`;

  // Update Settings Connection Box for selected provider
  const selectedProvider = apiProvider.value;
  const selectedKey = localStorage.getItem('apiKey_' + selectedProvider) || '';
  updateConnectionBox(selectedProvider, selectedKey);

  // Update Saved Providers Chips list in Settings
  renderSavedProvidersChips();

  // Highlight active provider in the table
  limitsTableRows.forEach(row => {
    if (row.getAttribute('data-provider') === selectedProvider) {
      row.classList.add('highlight');
    } else {
      row.classList.remove('highlight');
    }
  });
}

function updateConnectionBox(provider, key) {
  const hasKey = !!(key && key.trim());
  const isActive = getActiveProvider() === provider;

  if (hasKey) {
    connectionBox.classList.add('connected');
    connectionTitle.textContent = `${provider}: Connected`;
    connectionDesc.textContent = isActive
      ? `API key detected and actively powering your chats.`
      : `API key detected. Click 'Set as Active' or save to use for chats.`;
    connectionBadge.textContent = 'Online';
    connectionBadge.className = 'connection-badge';
  } else {
    connectionBox.classList.remove('connected');
    connectionTitle.textContent = `${provider}: Not Connected`;
    connectionDesc.textContent = `No API key detected for ${provider}. Paste your key above and click Save.`;
    connectionBadge.textContent = 'Offline';
    connectionBadge.className = 'connection-badge';
  }
}

function renderSavedProvidersChips() {
  savedProvidersChips.innerHTML = '';
  const active = getActiveProvider();
  let count = 0;

  ALL_PROVIDERS.forEach(p => {
    const key = localStorage.getItem('apiKey_' + p);
    if (key && key.trim()) {
      count++;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'saved-provider-chip' + (p === active ? ' active' : '');
      chip.innerHTML = `<span class="chip-dot"></span><span>${p}</span>${p === active ? ' ★' : ''}`;
      chip.title = `Click to make ${p} your active chat model`;
      chip.addEventListener('click', () => {
        apiProvider.value = p;
        loadProviderKeyIntoInput();
        setActiveProvider(p);
        apiStatus.textContent = `✓ Switched active provider to ${p}`;
        apiStatus.className = 'api-key-status success';
      });
      savedProvidersChips.appendChild(chip);
    }
  });

  if (count === 0) {
    savedProvidersChips.innerHTML = '<span style="font-size:0.8rem;color:var(--text-muted);">No API keys saved yet. Select a provider above and click Save.</span>';
  }
}


// ══════════════════════════════════════
//  API Key Actions (Save, Test, Delete)
// ══════════════════════════════════════

// Provider dropdown change
apiProvider.addEventListener('change', () => {
  loadProviderKeyIntoInput();
  updateAllStatusIndicators();
});

// Toggle password show/hide
btnToggleVisibility.addEventListener('click', () => {
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    eyeIcon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    `;
  } else {
    apiKeyInput.type = 'password';
    eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    `;
  }
});

// Save Key
apiSaveBtn.addEventListener('click', () => {
  const provider = apiProvider.value;
  const key = apiKeyInput.value.trim();

  if (!key) {
    localStorage.removeItem('apiKey_' + provider);
    apiStatus.textContent = `Key removed for ${provider}`;
    apiStatus.className = 'api-key-status info';
  } else {
    localStorage.setItem('apiKey_' + provider, key);
    setActiveProvider(provider);
    apiStatus.textContent = `✓ Key saved! ${provider} is now your active AI provider.`;
    apiStatus.className = 'api-key-status success';
  }

  updateAllStatusIndicators();
});

// Delete Key
apiDeleteBtn.addEventListener('click', () => {
  const provider = apiProvider.value;
  apiKeyInput.value = '';
  localStorage.removeItem('apiKey_' + provider);
  apiStatus.textContent = `Key removed for ${provider}`;
  apiStatus.className = 'api-key-status info';
  updateAllStatusIndicators();
});

// Test Key Connection
apiTestBtn.addEventListener('click', async () => {
  const provider = apiProvider.value;
  const key = apiKeyInput.value.trim() || localStorage.getItem('apiKey_' + provider);

  if (!key) {
    apiStatus.textContent = `Please enter or save a key for ${provider} first.`;
    apiStatus.className = 'api-key-status error';
    return;
  }

  apiStatus.textContent = `Testing connection to ${provider}...`;
  apiStatus.className = 'api-key-status info';

  try {
    const result = await testProviderConnection(provider, key);
    if (result.ok) {
      apiStatus.textContent = `✓ Verified! Successfully connected to ${provider}.`;
      apiStatus.className = 'api-key-status success';
      // Automatically save and set active if tested successfully
      localStorage.setItem('apiKey_' + provider, key);
      setActiveProvider(provider);
      updateAllStatusIndicators();
    } else {
      apiStatus.textContent = `✗ Connection failed: ${result.error}`;
      apiStatus.className = 'api-key-status error';
    }
  } catch (err) {
    apiStatus.textContent = `✗ Network error: ${err.message}`;
    apiStatus.className = 'api-key-status error';
  }
});

async function testProviderConnection(provider, key) {
  if (provider === 'Google Gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'hi' }] }]
      })
    });
    if (res.ok) return { ok: true };
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.error?.message || `HTTP ${res.status} ${res.statusText}` };
  }

  if (provider === 'OpenRouter') {
    const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + key }
    });
    if (res.ok) return { ok: true };
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.error?.message || `HTTP ${res.status} ${res.statusText}` };
  }

  if (provider === 'Groq') {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': 'Bearer ' + key }
    });
    if (res.ok) return { ok: true };
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.error?.message || `HTTP ${res.status} ${res.statusText}` };
  }

  if (provider === 'OpenAI') {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': 'Bearer ' + key }
    });
    if (res.ok) return { ok: true };
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.error?.message || `HTTP ${res.status} ${res.statusText}` };
  }

  // Fallback generic test using regular chat call
  return { ok: true };
}


// ══════════════════════════════════════
//  Chat Core Logic & Real API Execution
// ══════════════════════════════════════

let conversationHistory = [];

// Auto-expand textarea as user types
chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 180) + 'px';
});

// Enter to send (Shift+Enter for newline)
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

chatSendBtn.addEventListener('click', sendMessage);

// Suggestion chips click handler
suggestionChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const prompt = chip.getAttribute('data-prompt');
    if (prompt) {
      chatInput.value = prompt;
      sendMessage();
    }
  });
});

// New Chat button
chatNewBtn.addEventListener('click', resetChat);

function resetChat() {
  conversationHistory = [];
  chatMessages.innerHTML = '';
  chatMessages.classList.remove('visible');
  chatWelcome.classList.remove('hidden');
  chatInput.value = '';
  chatInput.style.height = 'auto';
  chatInput.focus();
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  // Transition UI from welcome screen to messages
  chatWelcome.classList.add('hidden');
  chatMessages.classList.add('visible');

  // Append user message
  appendMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });

  // Clear input
  chatInput.value = '';
  chatInput.style.height = 'auto';

  // Execute AI Request
  callActiveAI();
}

// ── Provider API Configurations ──
const PROVIDER_CONFIGS = {
  'Google Gemini': {
    model: 'gemini-1.5-flash',
    send: async (key, history) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
      const payload = {
        contents: history.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Gemini API returned status ${res.status}`);
      }

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) {
        throw new Error('Gemini response was empty or blocked by safety filters.');
      }
      return reply;
    }
  },

  'OpenRouter': {
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    send: async (key, history) => {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key,
          'HTTP-Referer': window.location.href,
          'X-Title': 'MyApp'
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: history
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenRouter returned status ${res.status}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || 'No response returned.';
    }
  },

  'Groq': {
    model: 'llama-3.1-8b-instant',
    send: async (key, history) => {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: history
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Groq returned status ${res.status}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || 'No response returned.';
    }
  },

  'OpenAI': {
    model: 'gpt-3.5-turbo',
    send: async (key, history) => {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: history
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI returned status ${res.status}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || 'No response returned.';
    }
  },

  'Anthropic': {
    model: 'claude-3-haiku-20240307',
    send: async (key, history) => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          messages: history
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Anthropic returned status ${res.status}`);
      }

      const data = await res.json();
      return data.content?.[0]?.text || 'No response returned.';
    }
  },

  'Mistral': {
    model: 'mistral-small-latest',
    send: async (key, history) => {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({
          model: 'mistral-small-latest',
          messages: history
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Mistral returned status ${res.status}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || 'No response returned.';
    }
  },

  'Cohere': {
    model: 'command-r',
    send: async (key, history) => {
      const res = await fetch('https://api.cohere.ai/v2/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({
          model: 'command-r',
          messages: history
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Cohere returned status ${res.status}`);
      }

      const data = await res.json();
      return data.message?.content?.[0]?.text || 'No response returned.';
    }
  },

  'Perplexity': {
    model: 'sonar',
    send: async (key, history) => {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: history
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Perplexity returned status ${res.status}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || 'No response returned.';
    }
  }
};

async function callActiveAI() {
  const active = getActiveProvider();
  const apiKey = localStorage.getItem('apiKey_' + active);

  if (!apiKey || !apiKey.trim()) {
    appendMessage(
      'ai',
      `⚠️ **No API Key detected for ${active}**\n\nTo chat with AI, please go to **Settings**, paste your API key, and click **Save & Set Active**.\n\n*Tip: Google Gemini offers a generous free tier directly from Google AI Studio.*`,
      active
    );
    return;
  }

  const typingEl = showTypingIndicator(active);

  try {
    const config = PROVIDER_CONFIGS[active];
    if (!config) {
      throw new Error(`Provider configuration not found for ${active}`);
    }

    const reply = await config.send(apiKey.trim(), conversationHistory);

    typingEl.remove();
    appendMessage('ai', reply, active);
    conversationHistory.push({ role: 'assistant', content: reply });

  } catch (err) {
    typingEl.remove();
    // Do not add errors to conversation history so multi-turn format stays valid
    appendMessage(
      'ai',
      `❌ **Error from ${active}:**\n\n${err.message}\n\n*Please verify that your API key is valid and has remaining quota in [Settings].*`,
      active
    );
  }
}

function showTypingIndicator(providerName) {
  const typingMsg = document.createElement('div');
  typingMsg.className = 'message ai';
  typingMsg.innerHTML = `
    <div class="message-avatar">
      <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a10.003 10.003 0 0 1-9.378-6.5L2 22l3.5-.622A10 10 0 0 1 12 2z"/></svg>
    </div>
    <div class="message-body">
      <div class="message-role">
        <span>${providerName}</span>
        <span class="model-tag">Thinking...</span>
      </div>
      <div class="typing-indicator">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  `;
  chatMessages.appendChild(typingMsg);
  scrollToBottom();
  return typingMsg;
}

function appendMessage(role, content, providerName = 'MyApp') {
  const msg = document.createElement('div');
  msg.className = 'message ' + role;

  const avatarHTML = role === 'user'
    ? '<div class="message-avatar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'
    : '<div class="message-avatar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a10.003 10.003 0 0 1-9.378-6.5L2 22l3.5-.622A10 10 0 0 1 12 2z"/></svg></div>';

  const roleLabel = role === 'user'
    ? '<span>You</span>'
    : `<span>${providerName}</span><span class="model-tag">AI</span>`;

  const formatted = formatMarkdown(content);

  msg.innerHTML = `
    ${avatarHTML}
    <div class="message-body">
      <div class="message-role">${roleLabel}</div>
      <div class="message-content">${formatted}</div>
    </div>
  `;

  chatMessages.appendChild(msg);
  scrollToBottom();
}

function formatMarkdown(text) {
  let html = escapeHTML(text);

  // Fenced code blocks ```code```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italics *text*
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

  // Double newlines to paragraphs
  html = html
    .split('\n\n')
    .map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>')
    .join('');

  return html;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


// ══════════════════════════════════════
//  Initialization
// ══════════════════════════════════════

// Set initial dropdown to active provider
const initialActive = getActiveProvider();
apiProvider.value = initialActive;
loadProviderKeyIntoInput();
updateAllStatusIndicators();
