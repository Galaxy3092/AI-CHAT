// ══════════════════════════════════════
//  MyApp — AI Chat & Auto-Model Engine
//  Zero Pre-Assumed Models & Auto-Fetching
// ══════════════════════════════════════

// ── DOM Elements ──
const navLinks = document.querySelectorAll('[data-page]');
const pages = document.querySelectorAll('.page');

// Settings Elements
const themeToggle = document.getElementById('themeToggle');
const apiProvider = document.getElementById('apiProvider');
const customEndpointGroup = document.getElementById('customEndpointGroup');
const customEndpointInput = document.getElementById('customEndpointInput');
const settingsModelSelect = document.getElementById('settingsModelSelect');
const fetchStatusText = document.getElementById('fetchStatusText');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiSaveBtn = document.getElementById('apiSaveBtn');
const apiTestBtn = document.getElementById('apiTestBtn');
const apiDeleteBtn = document.getElementById('apiDeleteBtn');
const apiClearAllBtn = document.getElementById('apiClearAllBtn');
const apiStatus = document.getElementById('apiStatus');
const btnToggleVisibility = document.getElementById('btnToggleVisibility');
const eyeIcon = document.getElementById('eyeIcon');
const activeProviderBadge = document.getElementById('activeProviderBadge');

// Connection Status Box
const connectionBox = document.getElementById('connectionBox');
const connectionDot = document.getElementById('connectionDot');
const connectionTitle = document.getElementById('connectionTitle');
const connectionDesc = document.getElementById('connectionDesc');
const connectionBadge = document.getElementById('connectionBadge');

// Live Metrics Elements
const statActiveModel = document.getElementById('statActiveModel');
const statProvider = document.getElementById('statProvider');
const statLatency = document.getElementById('statLatency');
const statTokens = document.getElementById('statTokens');
const statKeyDetails = document.getElementById('statKeyDetails');

// Chat Elements
const chatHeaderDot = document.getElementById('chatHeaderDot');
const chatModelSelect = document.getElementById('chatModelSelect');
const btnManageKey = document.getElementById('btnManageKey');
const chatNewBtn = document.getElementById('chatNewBtn');
const chatWelcome = document.getElementById('chatWelcome');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const suggestionChips = document.querySelectorAll('.suggestion-chip');

// Sidebar Elements
const sidebarDot = document.getElementById('sidebarDot');
const sidebarStatusText = document.getElementById('sidebarStatusText');
const sidebarChatsList = document.getElementById('sidebarChatsList');
const sidebarNewBtn = document.getElementById('sidebarNewBtn');


// ══════════════════════════════════════
//  Live Metrics State
// ══════════════════════════════════════

let liveMetrics = {
  lastLatencyMs: null,
  lastTokens: null,
  details: 'No requests sent yet. Real-time metrics will appear here.'
};


// ══════════════════════════════════════
//  Navigation & Themes
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
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  if (pageId === 'chat') chatInput.focus();
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(link.getAttribute('data-page'));
  });
});

btnManageKey.addEventListener('click', () => {
  navigateTo('settings');
});

themeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  document.documentElement.setAttribute('data-theme', savedTheme);
}


// ══════════════════════════════════════
//  Provider & Model Storage
// ══════════════════════════════════════

function getCurrentProvider() {
  return localStorage.getItem('active_provider') || apiProvider.value || 'Google Gemini';
}

function setCurrentProvider(p) {
  localStorage.setItem('active_provider', p);
  updateUI();
  autoFetchModels(p);
}

function getModelForProvider(p) {
  return (localStorage.getItem('model_' + p) || '').trim();
}

function setModelForProvider(p, m) {
  if (m !== undefined) {
    localStorage.setItem('model_' + p, m.trim());
  }
  updateUI();
}

function getKeyForProvider(p) {
  return (localStorage.getItem('apiKey_' + p) || '').trim();
}

function setKeyForProvider(p, k) {
  if (k) {
    localStorage.setItem('apiKey_' + p, k.trim());
  } else {
    localStorage.removeItem('apiKey_' + p);
  }
}

function getEndpointForProvider(p) {
  if (p === 'Custom / Local (Ollama, LM Studio)') {
    return localStorage.getItem('endpoint_' + p) || 'http://localhost:11434/v1/chat/completions';
  }
  return '';
}

function setEndpointForProvider(p, ep) {
  if (ep) {
    localStorage.setItem('endpoint_' + p, ep.trim());
  }
}


// ══════════════════════════════════════
//  Auto-Fetch Models from API
// ══════════════════════════════════════

let fetchAbortController = null;

async function autoFetchModels(provider) {
  const key = getKeyForProvider(provider);
  const endpoint = getEndpointForProvider(provider);

  fetchStatusText.textContent = 'Auto-fetching models...';
  fetchStatusText.style.color = '#3b82f6';

  if (fetchAbortController) {
    fetchAbortController.abort();
  }
  fetchAbortController = new AbortController();

  try {
    const models = await fetchModelsFromEndpoint(provider, key, endpoint, fetchAbortController.signal);

    if (models && models.length > 0) {
      localStorage.setItem('fetched_models_' + provider, JSON.stringify(models));
      renderModelDropdowns(provider, models);

      fetchStatusText.textContent = `✓ ${models.length} models fetched`;
      fetchStatusText.style.color = '#22c55e';
    } else {
      renderModelDropdowns(provider, []);
      fetchStatusText.textContent = key ? 'No models returned' : 'Enter key to fetch';
      fetchStatusText.style.color = 'var(--text-muted)';
    }
  } catch (err) {
    if (err.name === 'AbortError') return;
    renderModelDropdowns(provider, []);
    fetchStatusText.textContent = key ? 'Could not fetch models' : 'Key required to fetch';
    fetchStatusText.style.color = 'var(--text-muted)';
  }
}

async function fetchModelsFromEndpoint(provider, key, endpoint, signal) {
  const headers = {};
  if (key) headers['Authorization'] = 'Bearer ' + key;

  // 1. Google Gemini
  if (provider === 'Google Gemini') {
    if (!key) return [];
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, { signal });
    if (!res.ok) throw new Error(`Google returned status ${res.status}`);
    const data = await res.json();
    return (data.models || [])
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name.replace('models/', ''));
  }

  // 2. OpenRouter (Public endpoint, works even with no key)
  if (provider === 'OpenRouter') {
    const res = await fetch('https://openrouter.ai/api/v1/models', { headers, signal });
    if (!res.ok) throw new Error(`OpenRouter returned status ${res.status}`);
    const data = await res.json();
    return (data.data || []).slice(0, 40).map(m => m.id);
  }

  // 3. Local / Custom (Ollama, LM Studio)
  if (provider === 'Custom / Local (Ollama, LM Studio)') {
    const url = endpoint.replace('/chat/completions', '/models').replace('/v1/completions', '/v1/models');
    const res = await fetch(url, { headers, signal });
    if (!res.ok) throw new Error(`Local server status ${res.status}`);
    const data = await res.json();
    return (data.data || data.models || []).map(m => m.id || m.name || m);
  }

  // 4. Groq
  if (provider === 'Groq') {
    if (!key) return [];
    const res = await fetch('https://api.groq.com/openai/v1/models', { headers, signal });
    if (!res.ok) throw new Error(`Groq status ${res.status}`);
    const data = await res.json();
    return (data.data || []).map(m => m.id);
  }

  // 5. OpenAI
  if (provider === 'OpenAI') {
    if (!key) return [];
    const res = await fetch('https://api.openai.com/v1/models', { headers, signal });
    if (!res.ok) throw new Error(`OpenAI status ${res.status}`);
    const data = await res.json();
    return (data.data || []).filter(m => m.id.includes('gpt')).map(m => m.id);
  }

  // 6. Mistral
  if (provider === 'Mistral') {
    if (!key) return [];
    const res = await fetch('https://api.mistral.ai/v1/models', { headers, signal });
    if (!res.ok) throw new Error(`Mistral status ${res.status}`);
    const data = await res.json();
    return (data.data || []).map(m => m.id);
  }

  return [];
}

function renderModelDropdowns(provider, modelsList) {
  let savedModel = getModelForProvider(provider);

  // If models were fetched and none selected yet, auto-select the first model!
  if (!savedModel && modelsList.length > 0) {
    savedModel = modelsList[0];
    localStorage.setItem('model_' + provider, savedModel);
  }

  // 1. Settings Dropdown
  settingsModelSelect.innerHTML = '';
  if (modelsList.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = getKeyForProvider(provider)
      ? '(No models found for this endpoint)'
      : '(Add API key / URL to auto-fetch models)';
    settingsModelSelect.appendChild(opt);
  } else {
    modelsList.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      if (m === savedModel) opt.selected = true;
      settingsModelSelect.appendChild(opt);
    });
  }

  // 2. Chat Header Dropdown
  chatModelSelect.innerHTML = '';
  if (modelsList.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = `${provider}: No models loaded`;
    chatModelSelect.appendChild(opt);
  } else {
    modelsList.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = `${provider.replace('Google ', '')}: ${m}`;
      if (m === savedModel) opt.selected = true;
      chatModelSelect.appendChild(opt);
    });
  }

  updateUI();
}


// ══════════════════════════════════════
//  UI Synchronization & Indicators
// ══════════════════════════════════════

function updateUI() {
  const provider = getCurrentProvider();
  const model = getModelForProvider(provider);
  const key = getKeyForProvider(provider);
  const isCustom = provider === 'Custom / Local (Ollama, LM Studio)';

  // Settings inputs
  apiProvider.value = provider;
  apiKeyInput.value = key;
  customEndpointGroup.style.display = isCustom ? 'block' : 'none';
  if (isCustom) {
    customEndpointInput.value = getEndpointForProvider(provider);
  }

  // Header and Sidebar indicators
  const isReady = !!model;
  if (isReady) {
    chatHeaderDot.className = 'pulse-dot online';
    sidebarDot.className = 'status-indicator-dot active';
    sidebarStatusText.textContent = `${model}`;
    chatInput.placeholder = `Message ${model}... (Enter to send, Shift+Enter for newline)`;
  } else {
    chatHeaderDot.className = 'pulse-dot';
    sidebarDot.className = 'status-indicator-dot';
    sidebarStatusText.textContent = 'No Model Set';
    chatInput.placeholder = 'Select a model in the header or Settings to start chatting...';
  }

  // Settings Badge & Status Box
  activeProviderBadge.textContent = model ? `${provider}: ${model}` : `${provider}`;

  if (model) {
    connectionBox.classList.add('connected');
    connectionTitle.textContent = `Model: ${model}`;
    connectionDesc.textContent = key
      ? `Provider: ${provider} • Key verified • Ready to chat.`
      : `Provider: ${provider} • Local/Keyless mode • Ready to chat.`;
    connectionBadge.textContent = 'READY';
  } else {
    connectionBox.classList.remove('connected');
    connectionTitle.textContent = 'Waiting for Models...';
    connectionDesc.textContent = key
      ? 'Auto-fetching models list from provider...'
      : 'Enter your API key or local endpoint URL to auto-fetch models.';
    connectionBadge.textContent = 'STANDBY';
  }

  // Live Metrics Card
  statActiveModel.textContent = model || 'None';
  statProvider.textContent = provider;
  statLatency.textContent = liveMetrics.lastLatencyMs !== null ? `${liveMetrics.lastLatencyMs} ms` : '—';
  statTokens.textContent = liveMetrics.lastTokens !== null ? `${liveMetrics.lastTokens} tokens` : '—';
  statKeyDetails.textContent = liveMetrics.details;
}


// ══════════════════════════════════════
//  Event Handlers
// ══════════════════════════════════════

// Model changed in Settings dropdown
settingsModelSelect.addEventListener('change', () => {
  if (settingsModelSelect.value) {
    const p = getCurrentProvider();
    setModelForProvider(p, settingsModelSelect.value);
    chatModelSelect.value = settingsModelSelect.value;
  }
});

// Model changed in Chat Header dropdown
chatModelSelect.addEventListener('change', () => {
  if (chatModelSelect.value) {
    const p = getCurrentProvider();
    setModelForProvider(p, chatModelSelect.value);
    settingsModelSelect.value = chatModelSelect.value;
  }
});

// Provider dropdown changed
apiProvider.addEventListener('change', () => {
  setCurrentProvider(apiProvider.value);
});

// Custom endpoint changed
customEndpointInput.addEventListener('input', () => {
  const p = getCurrentProvider();
  setEndpointForProvider(p, customEndpointInput.value);
});

// Auto-fetch when API key is entered/pasted (debounced)
let keyDebounceTimer = null;
apiKeyInput.addEventListener('input', () => {
  clearTimeout(keyDebounceTimer);
  keyDebounceTimer = setTimeout(() => {
    const p = getCurrentProvider();
    setKeyForProvider(p, apiKeyInput.value);
    autoFetchModels(p);
  }, 600);
});

// Toggle password visibility
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

// Save Settings Button
apiSaveBtn.addEventListener('click', () => {
  const p = apiProvider.value;
  setCurrentProvider(p);
  setKeyForProvider(p, apiKeyInput.value);
  if (p === 'Custom / Local (Ollama, LM Studio)') {
    setEndpointForProvider(p, customEndpointInput.value);
  }
  autoFetchModels(p);

  apiStatus.textContent = `✓ Settings saved. Auto-fetching models for ${p}...`;
  apiStatus.className = 'api-key-status success';
});

// Clear settings for current provider
apiDeleteBtn.addEventListener('click', () => {
  const p = getCurrentProvider();
  apiKeyInput.value = '';
  localStorage.removeItem('model_' + p);
  localStorage.removeItem('apiKey_' + p);
  localStorage.removeItem('fetched_models_' + p);
  apiStatus.textContent = `Cleared settings for ${p}.`;
  apiStatus.className = 'api-key-status info';
  autoFetchModels(p);
});

// Reset All configurations
apiClearAllBtn.addEventListener('click', () => {
  if (!confirm('Clear all stored models, saved chats, and configurations?')) return;
  localStorage.clear();
  activeSessionId = null;
  conversationHistory = [];
  chatMessages.innerHTML = '';
  chatMessages.classList.remove('visible');
  chatWelcome.classList.remove('hidden');
  renderSidebarHistory();
  liveMetrics = {
    lastLatencyMs: null,
    lastTokens: null,
    details: 'All settings reset. Ready to auto-fetch.'
  };
  apiStatus.textContent = '✓ All configurations and chats wiped.';
  apiStatus.className = 'api-key-status info';
  updateUI();
  autoFetchModels(getCurrentProvider());
});

// Refresh & Test Button
apiTestBtn.addEventListener('click', async () => {
  const p = getCurrentProvider();
  const m = getModelForProvider(p);
  const key = apiKeyInput.value.trim() || getKeyForProvider(p);

  apiStatus.textContent = `Testing connection to ${p}...`;
  apiStatus.className = 'api-key-status info';

  // Trigger model fetch
  await autoFetchModels(p);

  const activeModel = getModelForProvider(p) || m;
  if (!activeModel) {
    apiStatus.textContent = 'Could not detect an active model. Please ensure the endpoint is running.';
    apiStatus.className = 'api-key-status error';
    return;
  }

  const t0 = performance.now();
  try {
    const res = await executeModelCall(p, activeModel, key, [{ role: 'user', content: 'hi' }]);
    const latency = Math.round(performance.now() - t0);

    apiStatus.textContent = `✓ Connected! ${activeModel} responded in ${latency}ms.`;
    apiStatus.className = 'api-key-status success';

    liveMetrics.lastLatencyMs = latency;
    liveMetrics.lastTokens = res.tokens;
    liveMetrics.details = `Verified with ${activeModel} in ${latency}ms.`;
    updateUI();
  } catch (err) {
    apiStatus.textContent = `✗ Connection failed: ${err.message}`;
    apiStatus.className = 'api-key-status error';
  }
});


// ══════════════════════════════════════
//  Chat Core Logic & Sessions in Sidebar
// ══════════════════════════════════════

let activeSessionId = localStorage.getItem('active_chat_id') || null;
let conversationHistory = [];

function getStoredSessions() {
  try {
    const raw = localStorage.getItem('chat_sessions');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse chat_sessions:', e);
    return [];
  }
}

function saveStoredSessions(sessions) {
  try {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save chat_sessions:', e);
  }
}

function renderSidebarHistory() {
  if (!sidebarChatsList) return;
  const sessions = getStoredSessions();
  sidebarChatsList.innerHTML = '';

  if (sessions.length === 0) {
    sidebarChatsList.innerHTML = '<div class="sidebar-no-chats">No saved chats yet</div>';
    return;
  }

  sessions.forEach(session => {
    const item = document.createElement('div');
    item.className = 'sidebar-chat-item' + (session.id === activeSessionId ? ' active' : '');
    item.setAttribute('data-id', session.id);

    const safeTitle = escapeHTML(session.title || 'Untitled Chat');

    item.innerHTML = `
      <span class="sidebar-chat-title" title="${safeTitle}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>${safeTitle}</span>
      </span>
      <button type="button" class="sidebar-chat-delete" title="Delete chat" aria-label="Delete chat">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;

    item.addEventListener('click', (e) => {
      if (e.target.closest('.sidebar-chat-delete')) return;
      loadChatSession(session.id);
    });

    const delBtn = item.querySelector('.sidebar-chat-delete');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteChatSession(session.id);
      });
    }

    sidebarChatsList.appendChild(item);
  });
}

function loadChatSession(sessionId) {
  const sessions = getStoredSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return;

  activeSessionId = sessionId;
  localStorage.setItem('active_chat_id', sessionId);
  conversationHistory = session.messages || [];

  navigateTo('chat');

  chatMessages.innerHTML = '';
  if (conversationHistory.length > 0) {
    chatWelcome.classList.add('hidden');
    chatMessages.classList.add('visible');
    conversationHistory.forEach(msg => {
      appendMessage(
        msg.role === 'user' ? 'user' : 'ai',
        msg.content,
        msg.provider || 'MyApp',
        msg.model || ''
      );
    });
    scrollToBottom();
  } else {
    chatWelcome.classList.remove('hidden');
    chatMessages.classList.remove('visible');
  }

  renderSidebarHistory();
  chatInput.focus();
}

function deleteChatSession(sessionId) {
  let sessions = getStoredSessions();
  sessions = sessions.filter(s => s.id !== sessionId);
  saveStoredSessions(sessions);

  if (activeSessionId === sessionId) {
    startNewChat();
  } else {
    renderSidebarHistory();
  }
}

function startNewChat() {
  activeSessionId = null;
  localStorage.removeItem('active_chat_id');
  conversationHistory = [];

  chatMessages.innerHTML = '';
  chatMessages.classList.remove('visible');
  chatWelcome.classList.remove('hidden');
  chatInput.value = '';
  chatInput.style.height = 'auto';

  renderSidebarHistory();
  navigateTo('chat');
  chatInput.focus();
}

chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 180) + 'px';
});

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

chatSendBtn.addEventListener('click', sendMessage);

if (sidebarNewBtn) {
  sidebarNewBtn.addEventListener('click', startNewChat);
}
chatNewBtn.addEventListener('click', startNewChat);

suggestionChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const prompt = chip.getAttribute('data-prompt');
    if (prompt) {
      chatInput.value = prompt;
      sendMessage();
    }
  });
});

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  const p = getCurrentProvider();
  const m = getModelForProvider(p);

  if (!m) {
    alert('Please select or wait for a model to load in the header above or in Settings.');
    return;
  }

  // Ensure active session exists or create a new one
  let sessions = getStoredSessions();
  let currentSession = sessions.find(s => s.id === activeSessionId);

  if (!currentSession) {
    const cleanTitle = text.replace(/[\n\r]+/g, ' ').trim();
    const title = cleanTitle.length > 30 ? cleanTitle.substring(0, 30) + '...' : cleanTitle;
    currentSession = {
      id: 'chat-' + Date.now(),
      title: title || 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };
    activeSessionId = currentSession.id;
    localStorage.setItem('active_chat_id', activeSessionId);
    sessions.unshift(currentSession);
  }

  chatWelcome.classList.add('hidden');
  chatMessages.classList.add('visible');

  appendMessage('user', text);

  const userMsg = {
    role: 'user',
    content: text,
    timestamp: Date.now()
  };
  conversationHistory.push(userMsg);
  currentSession.messages.push(userMsg);
  currentSession.updatedAt = Date.now();

  saveStoredSessions(sessions);
  renderSidebarHistory();

  chatInput.value = '';
  chatInput.style.height = 'auto';

  runChatQuery(p, m);
}

async function runChatQuery(provider, model) {
  const key = getKeyForProvider(provider);
  const typingEl = showTypingIndicator(provider, model);
  const t0 = performance.now();

  try {
    const result = await executeModelCall(provider, model, key, conversationHistory);
    const latency = Math.round(performance.now() - t0);

    liveMetrics.lastLatencyMs = latency;
    liveMetrics.lastTokens = result.tokens;
    liveMetrics.details = `Last response: ${latency}ms from ${model}.`;
    updateUI();

    typingEl.remove();
    appendMessage('ai', result.reply, provider, model);

    const aiMsg = {
      role: 'assistant',
      content: result.reply,
      provider: provider,
      model: model,
      timestamp: Date.now()
    };
    conversationHistory.push(aiMsg);

    const sessions = getStoredSessions();
    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (currentSession) {
      currentSession.messages.push(aiMsg);
      currentSession.updatedAt = Date.now();
      saveStoredSessions(sessions);
    }

  } catch (err) {
    typingEl.remove();
    appendMessage(
      'ai',
      `❌ **Error from ${model}:**\n\n${err.message}\n\n*Check your endpoint or API key in [Settings].*`,
      provider,
      model
    );
  }
}

// ── Model Call Execution ──
async function executeModelCall(provider, model, key, history) {
  // Sanitize history to pure role & content for API specs
  const cleanHistory = history.map(m => ({
    role: m.role,
    content: m.content
  }));

  // 1. Google Gemini
  if (provider === 'Google Gemini') {
    if (!key) throw new Error('Google Gemini requires an API key in Settings.');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const payload = {
      contents: cleanHistory.map(m => ({
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
      throw new Error(err.error?.message || `Google returned status ${res.status}`);
    }
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error('Response was empty or filtered.');
    return { reply, tokens: data.usageMetadata?.totalTokenCount || null };
  }

  // 2. Anthropic
  if (provider === 'Anthropic') {
    if (!key) throw new Error('Anthropic requires an API key in Settings.');
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1500,
        messages: cleanHistory
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic returned status ${res.status}`);
    }
    const data = await res.json();
    return {
      reply: data.content?.[0]?.text || '',
      tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
    };
  }

  // 3. OpenAI-Compatible (OpenAI, OpenRouter, Groq, Mistral, Perplexity, Cohere, Local/Ollama)
  let endpoint = 'https://api.openai.com/v1/chat/completions';
  if (provider === 'OpenRouter') endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  if (provider === 'Groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  if (provider === 'Mistral') endpoint = 'https://api.mistral.ai/v1/chat/completions';
  if (provider === 'Perplexity') endpoint = 'https://api.perplexity.ai/chat/completions';
  if (provider === 'Cohere') endpoint = 'https://api.cohere.ai/v2/chat';
  if (provider === 'Custom / Local (Ollama, LM Studio)') {
    endpoint = getEndpointForProvider(provider) || 'http://localhost:11434/v1/chat/completions';
  }

  const headers = { 'Content-Type': 'application/json' };
  if (key) {
    headers['Authorization'] = 'Bearer ' + key;
  }
  if (provider === 'OpenRouter') {
    headers['HTTP-Referer'] = window.location.href;
    headers['X-Title'] = 'MyApp';
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ model: model, messages: cleanHistory })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || err.message || `Server returned status ${res.status}`);
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content || data.message?.content?.[0]?.text || 'No text returned.';
  const tokens = data.usage?.total_tokens || null;
  return { reply, tokens };
}


// ══════════════════════════════════════
//  Message Rendering Helpers
// ══════════════════════════════════════

// Copy to Clipboard with Visual Feedback
function copyToClipboard(text, btn) {
  if (!text) return;
  const originalHTML = btn.innerHTML;

  function setCopiedState() {
    btn.classList.add('copied');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Copied!</span>
    `;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = originalHTML;
    }, 2000);
  }

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(setCopiedState).catch(() => {
      fallbackCopyText(text, setCopiedState);
    });
  } else {
    fallbackCopyText(text, setCopiedState);
  }
}

function fallbackCopyText(text, callback) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful && callback) callback();
  } catch (err) {
    console.error('Fallback copy failed', err);
  }
  document.body.removeChild(textArea);
}

function showTypingIndicator(providerName, modelName) {
  const typingMsg = document.createElement('div');
  typingMsg.className = 'message ai';
  typingMsg.innerHTML = `
    <div class="message-avatar">
      <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a10.003 10.003 0 0 1-9.378-6.5L2 22l3.5-.622A10 10 0 0 1 12 2z"/></svg>
    </div>
    <div class="message-body">
      <div class="message-role">
        <span>${modelName}</span>
        <span class="model-tag">Generating...</span>
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

function appendMessage(role, content, providerName = 'MyApp', modelName = '') {
  const msg = document.createElement('div');
  msg.className = 'message ' + role;

  const avatarHTML = role === 'user'
    ? '<div class="message-avatar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'
    : '<div class="message-avatar"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a10.003 10.003 0 0 1-9.378-6.5L2 22l3.5-.622A10 10 0 0 1 12 2z"/></svg></div>';

  const roleLabel = role === 'user'
    ? '<span>You</span>'
    : `<span>${modelName || providerName}</span>`;

  const copyLabel = role === 'user' ? 'Copy question' : 'Copy response';

  const formatted = formatMarkdown(content);

  msg.innerHTML = `
    ${avatarHTML}
    <div class="message-body">
      <div class="message-header">
        <div class="message-role">${roleLabel}</div>
      </div>
      <div class="message-content">${formatted}</div>
      <div class="message-actions">
        <button type="button" class="btn-copy-msg" title="${copyLabel}" aria-label="${copyLabel}">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span class="copy-text">Copy</span>
        </button>
      </div>
    </div>
  `;

  const copyBtn = msg.querySelector('.btn-copy-msg');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => copyToClipboard(content, copyBtn));
  }

  chatMessages.appendChild(msg);
  scrollToBottom();
}

function formatMarkdown(text) {
  let html = escapeHTML(text);
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code class="language-${lang}">${code}</code></pre>`);
    return `__CODE_BLOCK_${idx}__`;
  });
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  html = html.split('\n\n').map(p => {
    if (p.trim().match(/^__CODE_BLOCK_\d+__$/)) {
      return p;
    }
    return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
  }).join('');
  html = html.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => codeBlocks[idx]);
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
//  Initial Load & History Migration
// ══════════════════════════════════════

function initChatHistory() {
  let sessions = getStoredSessions();

  // Migrate legacy single chat_history if found
  const legacyHistory = localStorage.getItem('chat_history');
  if (sessions.length === 0 && legacyHistory) {
    try {
      const parsed = JSON.parse(legacyHistory);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstUser = parsed.find(m => m.role === 'user');
        const rawTitle = firstUser ? firstUser.content.replace(/[\n\r]+/g, ' ').trim() : 'Previous Chat';
        const title = rawTitle.length > 30 ? rawTitle.substring(0, 30) + '...' : rawTitle;
        const migrated = {
          id: 'chat-' + Date.now(),
          title: title || 'Previous Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: parsed
        };
        sessions = [migrated];
        saveStoredSessions(sessions);
        activeSessionId = migrated.id;
        localStorage.setItem('active_chat_id', activeSessionId);
      }
    } catch (e) {}
  }

  renderSidebarHistory();

  if (activeSessionId) {
    const existing = sessions.find(s => s.id === activeSessionId);
    if (existing) {
      loadChatSession(activeSessionId);
      return;
    }
  }

  if (sessions.length > 0) {
    loadChatSession(sessions[0].id);
  } else {
    startNewChat();
  }
}

const initProvider = getCurrentProvider();
updateUI();

// Initialize sidebar chat history and load active session
initChatHistory();

// Check if cached models exist, otherwise auto-fetch immediately
const cached = localStorage.getItem('fetched_models_' + initProvider);
if (cached) {
  try {
    const list = JSON.parse(cached);
    if (Array.isArray(list) && list.length > 0) {
      renderModelDropdowns(initProvider, list);
    }
  } catch (e) {}
}

// Automatically fetch live models in the background
autoFetchModels(initProvider);
