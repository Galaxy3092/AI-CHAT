// ── Page navigation ──
const navLinks = document.querySelectorAll('[data-page]');
const pages = document.querySelectorAll('.page');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.getAttribute('data-page');

    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    pages.forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + target).classList.add('active');
  });
});

// ── Theme toggle ──
const toggle = document.getElementById('themeToggle');
toggle.addEventListener('click', () => {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// ── API Key management ──
const apiProvider = document.getElementById('apiProvider');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiSaveBtn = document.getElementById('apiSaveBtn');
const apiStatus = document.getElementById('apiStatus');

function loadApiKey() {
  const provider = apiProvider.value;
  const saved = localStorage.getItem('apiKey_' + provider);
  if (saved) {
    apiKeyInput.value = saved;
    apiStatus.textContent = '\u2713 Key saved for ' + provider;
  } else {
    apiKeyInput.value = '';
    apiStatus.textContent = '';
  }
  updateLimitsBar();
}

apiProvider.addEventListener('change', loadApiKey);

apiSaveBtn.addEventListener('click', () => {
  const provider = apiProvider.value;
  const key = apiKeyInput.value.trim();

  if (!key) {
    apiStatus.textContent = '';
    localStorage.removeItem('apiKey_' + provider);
    updateLimitsBar();
    return;
  }

  localStorage.setItem('apiKey_' + provider, key);
  apiStatus.textContent = '\u2713 Key saved for ' + provider;
  updateLimitsBar();
});

loadApiKey();


// ══════════════════════════════════════
//  API Limits Bar
// ══════════════════════════════════════

const apiLimitsBar = document.getElementById('apiLimitsBar');
const apiLimitsTitle = document.getElementById('apiLimitsTitle');
const apiLimitsDetail = document.getElementById('apiLimitsDetail');
const apiLimitsBadge = document.getElementById('apiLimitsBadge');
const limitsTableRows = document.querySelectorAll('.limits-table tbody tr');

const connectionBox = document.getElementById('connectionBox');
const connectionTitle = document.getElementById('connectionTitle');
const connectionDesc = document.getElementById('connectionDesc');
const connectionBadge = document.getElementById('connectionBadge');

const providerLimits = {
  'OpenRouter':    { rpm: 20, tpm: 'Varies', daily: '200 req',    note: 'Unified gateway to all models. Free tier has 200 req/day; limits depend on the model you route to.' },
  'OpenAI':        { rpm: 3,  tpm: '40K',    daily: '200 req',    note: 'Free tier is heavily rate-limited. Upgrade to Tier 1 ($5 paid) for 500 RPM.' },
  'Anthropic':     { rpm: 5,  tpm: '20K',    daily: '1,000 req',  note: 'Free tier allows 5 RPM. Build tier ($5 credit) bumps to 50 RPM.' },
  'Google Gemini': { rpm: 15, tpm: '1M',     daily: '1,500 req',  note: 'Generous free tier. Gemini 1.5 Flash allows 15 RPM / 1M TPM for free.' },
  'Mistral':       { rpm: 1,  tpm: '500K',   daily: 'Unlimited',  note: 'Free tier is 1 RPM. Pay-as-you-go removes the per-minute limit.' },
  'Cohere':        { rpm: 20, tpm: '\u2014',  daily: '1,000 req',  note: 'Trial keys get 20 RPM. Production keys have higher limits.' },
  'Groq':          { rpm: 30, tpm: '15K',    daily: '14,400 req', note: 'Very fast inference. Free tier allows 30 RPM with 15K TPM.' },
  'Perplexity':    { rpm: 5,  tpm: '\u2014',  daily: 'Varies',     note: 'Rate limits depend on your subscription plan.' }
};

function updateLimitsBar() {
  const provider = apiProvider.value;
  const hasSavedKey = !!localStorage.getItem('apiKey_' + provider);
  const limits = providerLimits[provider];

  if (hasSavedKey) {
    // Connection box
    connectionBox.classList.add('connected');
    connectionTitle.textContent = 'Connected to ' + provider;
    connectionDesc.textContent = 'API key saved \u2014 ready to chat';
    connectionBadge.textContent = 'Online';

    // Limits bar
    apiLimitsBar.classList.add('connected');
    apiLimitsTitle.textContent = provider + ' limits';
    apiLimitsDetail.textContent = limits.rpm + ' RPM \u00b7 ' + limits.tpm + ' TPM \u00b7 ' + limits.daily + '/day \u2014 ' + limits.note;
    apiLimitsBadge.textContent = 'Active';
    apiLimitsBadge.classList.add('active');
  } else {
    // Connection box
    connectionBox.classList.remove('connected');
    connectionTitle.textContent = 'Not connected';
    connectionDesc.textContent = 'No API key saved for ' + provider;
    connectionBadge.textContent = 'Offline';

    // Limits bar
    apiLimitsBar.classList.remove('connected');
    apiLimitsTitle.textContent = provider + ' free tier limits';
    apiLimitsDetail.textContent = limits.rpm + ' RPM \u00b7 ' + limits.tpm + ' TPM \u00b7 ' + limits.daily + '/day. ' + limits.note;
    apiLimitsBadge.textContent = 'Inactive';
    apiLimitsBadge.classList.remove('active');
  }

  limitsTableRows.forEach(row => {
    if (row.getAttribute('data-provider') === provider) {
      row.classList.add('highlight');
    } else {
      row.classList.remove('highlight');
    }
  });
}


// ══════════════════════════════════════
//  Chat functionality
// ══════════════════════════════════════

const chatWelcome = document.getElementById('chatWelcome');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

// Conversation history for context
let conversationHistory = [];

// Auto-resize textarea as user types
chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 160) + 'px';
});

// Send on Enter (Shift+Enter for newline)
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

chatSendBtn.addEventListener('click', sendMessage);

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  // Switch from welcome to chat view
  chatWelcome.classList.add('hidden');
  chatMessages.classList.add('visible');

  // Add user message
  appendMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });

  // Clear input
  chatInput.value = '';
  chatInput.style.height = 'auto';

  // Call AI
  callAI();
}

// ── Provider API configuration ──
const providerConfig = {
  'OpenRouter': {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'openai/gpt-3.5-turbo',
    authHeader: (key) => ({ 'Authorization': 'Bearer ' + key }),
    buildBody: (messages, model) => ({
      model: model,
      messages: messages
    }),
    extractReply: (data) => data.choices[0].message.content
  },
  'OpenAI': {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    authHeader: (key) => ({ 'Authorization': 'Bearer ' + key }),
    buildBody: (messages, model) => ({
      model: model,
      messages: messages
    }),
    extractReply: (data) => data.choices[0].message.content
  },
  'Anthropic': {
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-haiku-20240307',
    authHeader: (key) => ({
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    }),
    buildBody: (messages, model) => ({
      model: model,
      max_tokens: 1024,
      messages: messages
    }),
    extractReply: (data) => data.content[0].text
  },
  'Google Gemini': {
    url: (key) => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + key,
    model: 'gemini-1.5-flash',
    authHeader: () => ({}),
    buildBody: (messages) => ({
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    }),
    extractReply: (data) => data.candidates[0].content.parts[0].text
  },
  'Mistral': {
    url: 'https://api.mistral.ai/v1/chat/completions',
    model: 'mistral-small-latest',
    authHeader: (key) => ({ 'Authorization': 'Bearer ' + key }),
    buildBody: (messages, model) => ({
      model: model,
      messages: messages
    }),
    extractReply: (data) => data.choices[0].message.content
  },
  'Cohere': {
    url: 'https://api.cohere.ai/v2/chat',
    model: 'command-r',
    authHeader: (key) => ({ 'Authorization': 'Bearer ' + key }),
    buildBody: (messages, model) => ({
      model: model,
      messages: messages
    }),
    extractReply: (data) => data.message.content[0].text
  },
  'Groq': {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-8b-instant',
    authHeader: (key) => ({ 'Authorization': 'Bearer ' + key }),
    buildBody: (messages, model) => ({
      model: model,
      messages: messages
    }),
    extractReply: (data) => data.choices[0].message.content
  },
  'Perplexity': {
    url: 'https://api.perplexity.ai/chat/completions',
    model: 'sonar',
    authHeader: (key) => ({ 'Authorization': 'Bearer ' + key }),
    buildBody: (messages, model) => ({
      model: model,
      messages: messages
    }),
    extractReply: (data) => data.choices[0].message.content
  }
};

async function callAI() {
  // Find the first provider with a saved key
  const providers = ['OpenRouter', 'OpenAI', 'Anthropic', 'Google Gemini', 'Mistral', 'Cohere', 'Groq', 'Perplexity'];
  let activeProvider = null;
  let apiKey = null;

  for (const p of providers) {
    const k = localStorage.getItem('apiKey_' + p);
    if (k) {
      activeProvider = p;
      apiKey = k;
      break;
    }
  }

  if (!activeProvider) {
    appendMessage('ai', 'No API key found. Go to **Settings** and save an API key for any provider to start chatting.\n\nOpenRouter is recommended \u2014 one key gives you access to all models.');
    conversationHistory.push({ role: 'assistant', content: 'No API key found.' });
    return;
  }

  // Show typing indicator
  const typingEl = showTypingIndicator();

  try {
    const config = providerConfig[activeProvider];
    const url = typeof config.url === 'function' ? config.url(apiKey) : config.url;
    const headers = {
      'Content-Type': 'application/json',
      ...config.authHeader(apiKey)
    };
    const body = config.buildBody(conversationHistory, config.model);

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    typingEl.remove();

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || errData.message || response.statusText;
      appendMessage('ai', 'API error from ' + activeProvider + ' (' + response.status + '):\n\n' + errMsg);
      return;
    }

    const data = await response.json();
    const reply = config.extractReply(data);

    appendMessage('ai', reply);
    conversationHistory.push({ role: 'assistant', content: reply });

  } catch (err) {
    typingEl.remove();
    appendMessage('ai', 'Network error connecting to ' + activeProvider + ':\n\n' + err.message + '\n\nMake sure your API key is valid and you have internet access.');
  }
}

function showTypingIndicator() {
  const typingMsg = document.createElement('div');
  typingMsg.className = 'message ai';
  typingMsg.innerHTML =
    '<div class="message-avatar">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
        '<path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a10.003 10.003 0 0 1-9.378-6.5L2 22l3.5-.622A10 10 0 0 1 12 2z"/>' +
        '<circle cx="8" cy="12" r="1" fill="currentColor" stroke="none"/>' +
        '<circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>' +
        '<circle cx="16" cy="12" r="1" fill="currentColor" stroke="none"/>' +
      '</svg>' +
    '</div>' +
    '<div class="message-body">' +
      '<div class="message-role">MyApp</div>' +
      '<div class="typing-indicator">' +
        '<div class="dot"></div>' +
        '<div class="dot"></div>' +
        '<div class="dot"></div>' +
      '</div>' +
    '</div>';
  chatMessages.appendChild(typingMsg);
  scrollToBottom();
  return typingMsg;
}

function appendMessage(role, content) {
  const msg = document.createElement('div');
  msg.className = 'message ' + role;

  const avatarHTML = role === 'user'
    ? '<div class="message-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'
    : '<div class="message-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a10.003 10.003 0 0 1-9.378-6.5L2 22l3.5-.622A10 10 0 0 1 12 2z"/><circle cx="8" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="1" fill="currentColor" stroke="none"/></svg></div>';

  const roleLabel = role === 'user' ? 'You' : 'MyApp';

  // Simple markdown-ish rendering
  const formatted = formatContent(content);

  msg.innerHTML = avatarHTML +
    '<div class="message-body">' +
      '<div class="message-role">' + roleLabel + '</div>' +
      '<div class="message-content">' + formatted + '</div>' +
    '</div>';

  chatMessages.appendChild(msg);
  scrollToBottom();
}

function formatContent(text) {
  // Escape HTML first
  let html = escapeHTML(text);

  // Code blocks: ```...```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

  // Inline code: `...`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold: **...**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic: *...*
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

  // Split into paragraphs
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
