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


// ── API limits bar ──
const apiLimitsBar = document.getElementById('apiLimitsBar');
const apiLimitsTitle = document.getElementById('apiLimitsTitle');
const apiLimitsDetail = document.getElementById('apiLimitsDetail');
const apiLimitsBadge = document.getElementById('apiLimitsBadge');
const limitsTableRows = document.querySelectorAll('.limits-table tbody tr');

const providerLimits = {
  'OpenAI':        { rpm: 3,  tpm: '40K',  daily: '200 req',    note: 'Free tier is heavily rate-limited. Upgrade to Tier 1 (\$5 paid) for 500 RPM.' },
  'Anthropic':     { rpm: 5,  tpm: '20K',  daily: '1,000 req',  note: 'Free tier allows 5 RPM. Build tier (\$5 credit) bumps to 50 RPM.' },
  'Google Gemini': { rpm: 15, tpm: '1M',   daily: '1,500 req',  note: 'Generous free tier. Gemini 1.5 Flash allows 15 RPM / 1M TPM for free.' },
  'Mistral':       { rpm: 1,  tpm: '500K', daily: 'Unlimited',  note: 'Free tier is 1 RPM. Pay-as-you-go removes the per-minute limit.' },
  'Cohere':        { rpm: 20, tpm: '—',    daily: '1,000 req',  note: 'Trial keys get 20 RPM. Production keys have higher limits.' },
  'Groq':          { rpm: 30, tpm: '15K',  daily: '14,400 req', note: 'Very fast inference. Free tier allows 30 RPM with 15K TPM.' },
  'Perplexity':    { rpm: 5,  tpm: '—',    daily: 'Varies',     note: 'Rate limits depend on your subscription plan.' }
};

function updateLimitsBar() {
  const provider = apiProvider.value;
  const hasSavedKey = !!localStorage.getItem('apiKey_' + provider);
  const limits = providerLimits[provider];

  // Update bar state
  if (hasSavedKey) {
    apiLimitsBar.classList.add('connected');
    apiLimitsTitle.textContent = 'Connected to ' + provider;
    apiLimitsDetail.textContent = limits.rpm + ' RPM · ' + limits.tpm + ' TPM · ' + limits.daily + '/day — ' + limits.note;
    apiLimitsBadge.textContent = 'Active';
    apiLimitsBadge.classList.add('active');
  } else {
    apiLimitsBar.classList.remove('connected');
    apiLimitsTitle.textContent = 'No API key for ' + provider;
    apiLimitsDetail.textContent = 'Free tier: ' + limits.rpm + ' RPM · ' + limits.tpm + ' TPM · ' + limits.daily + '/day. ' + limits.note;
    apiLimitsBadge.textContent = 'Inactive';
    apiLimitsBadge.classList.remove('active');
  }

  // Highlight current provider row in table
  limitsTableRows.forEach(row => {
    if (row.getAttribute('data-provider') === provider) {
      row.classList.add('highlight');
    } else {
      row.classList.remove('highlight');
    }
  });
}

// Update limits bar when provider changes or key is saved
apiProvider.addEventListener('change', updateLimitsBar);
const origSaveClick = apiSaveBtn.onclick;
apiSaveBtn.addEventListener('click', () => {
  setTimeout(updateLimitsBar, 50);
});

updateLimitsBar();
