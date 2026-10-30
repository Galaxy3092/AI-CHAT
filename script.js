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
    apiStatus.textContent = '✓ Key saved for ' + provider;
  } else {
    apiKeyInput.value = '';
    apiStatus.textContent = '';
  }
}

apiProvider.addEventListener('change', loadApiKey);

apiSaveBtn.addEventListener('click', () => {
  const provider = apiProvider.value;
  const key = apiKeyInput.value.trim();

  if (!key) {
    apiStatus.textContent = '';
    localStorage.removeItem('apiKey_' + provider);
    return;
  }

  localStorage.setItem('apiKey_' + provider, key);
  apiStatus.textContent = '✓ Key saved for ' + provider;
});

loadApiKey();


// ══════════════════════════════════════
//  Chat functionality
// ══════════════════════════════════════

const chatWelcome = document.getElementById('chatWelcome');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

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

  // Clear input
  chatInput.value = '';
  chatInput.style.height = 'auto';

  // Show typing indicator then AI response
  showTypingThenRespond(text);
}

function appendMessage(role, content) {
  const msg = document.createElement('div');
  msg.className = 'message ' + role;

  const avatarHTML = role === 'user'
    ? '<div class="message-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>'
    : '<div class="message-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a10.003 10.003 0 0 1-9.378-6.5L2 22l3.5-.622A10 10 0 0 1 12 2z"/><circle cx="8" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="12" r="1" fill="currentColor" stroke="none"/></svg></div>';

  const roleLabel = role === 'user' ? 'You' : 'MyApp';

  // Convert newlines to paragraphs
  const formatted = content
    .split('\n\n')
    .map(p => '<p>' + escapeHTML(p).replace(/\n/g, '<br>') + '</p>')
    .join('');

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

function showTypingThenRespond(userText) {
  // Create typing indicator message
  const typingMsg = document.createElement('div');
  typingMsg.className = 'message ai';
  typingMsg.innerHTML = `
    <div class="message-avatar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10a10.003 10.003 0 0 1-9.378-6.5L2 22l3.5-.622A10 10 0 0 1 12 2z"/>
        <circle cx="8" cy="12" r="1" fill="currentColor" stroke="none"/>
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
        <circle cx="16" cy="12" r="1" fill="currentColor" stroke="none"/>
      </svg>
    </div>
    <div class="message-body">
      <div class="message-role">MyApp</div>
      <div class="typing-indicator">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  `;

  chatMessages.appendChild(typingMsg);
  scrollToBottom();

  // Simulate a delay then replace with response
  const delay = 800 + Math.random() * 1200;
  setTimeout(() => {
    typingMsg.remove();
    const response = generatePlaceholderResponse(userText);
    appendMessage('ai', response);
  }, delay);
}

function generatePlaceholderResponse(userText) {
  // Placeholder responses until a real API is wired up
  const lower = userText.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hey there! 👋 I'm MyApp, your AI assistant. How can I help you today?\n\nYou can ask me anything — just type your question below.";
  }

  if (lower.includes('how are you')) {
    return "I'm doing great, thanks for asking! I'm ready to help you with whatever you need. What's on your mind?";
  }

  if (lower.includes('what can you do') || lower.includes('help')) {
    return "I can help with a wide range of tasks:\n\n• Answer questions on any topic\n• Help with writing and editing\n• Explain complex concepts\n• Brainstorm ideas\n• And much more!\n\nTo connect me to a real AI, head over to Settings and add your API key.";
  }

  if (lower.includes('thank')) {
    return "You're welcome! Let me know if there's anything else I can help with. 😊";
  }

  const responses = [
    "That's an interesting question! To give you real AI-powered answers, connect an API key in Settings.\n\nFor now, I'm running in demo mode — but the chat interface is fully functional!",
    "Great question! I'm currently in demo mode without an AI backend.\n\nHead to Settings → AI API Key to connect OpenAI, Anthropic, Gemini, or another provider, and I'll be able to give you real answers.",
    "I'd love to help with that! Right now I'm a demo — connect your preferred AI provider in Settings to unlock real responses.\n\nThe UI is ready to go though — try sending more messages to see the chat in action!",
    "Hmm, that's a thoughtful prompt! Once you add an API key in Settings, I'll be able to give you a proper answer.\n\nIn the meantime, feel free to explore the interface — the chat, theme toggle, and settings all work!"
  ];

  return responses[Math.floor(Math.random() * responses.length)];
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
