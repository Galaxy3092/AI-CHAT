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

// Load saved key for the selected provider
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

// Load on init
loadApiKey();
