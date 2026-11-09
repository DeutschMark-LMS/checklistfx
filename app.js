// ==========================================================================
// IN-APP TOAST NOTIFICATION & CONFIRMATION DIALOG ENGINE
// Replaces intrusive native browser alert() and confirm() popups
// ==========================================================================

function getOrCreateToastContainer() {
  let container = document.getElementById('app-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'app-toast-container';
    container.className = 'app-toast-container';
    // Robust inline fallback styles so it NEVER falls into document flow or bottom corner
    container.style.cssText = 'position:fixed;top:1.25rem;right:1.25rem;z-index:9999999;display:flex;flex-direction:column;gap:0.65rem;max-width:380px;width:calc(100vw - 2.5rem);pointer-events:none;';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Display sleek, trading-terminal in-app toast notification
 * @param {Object} options - { title, message, type: 'success'|'warning'|'error'|'info', duration: 4000 }
 */
function showAppToast(options = {}) {
  let { title = '', message = '', type = 'success', duration = 3800 } = options;
  if (typeof options === 'string') {
    message = options;
    title = type === 'success' ? 'Success' : 'Checklist Fx';
  }

  const container = getOrCreateToastContainer();
  const toast = document.createElement('div');
  toast.className = `app-toast toast-${type}`;

  const colorMap = {
    success: { border: 'rgba(16, 185, 129, 0.45)', bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', glow: 'rgba(16, 185, 129, 0.2)' },
    warning: { border: 'rgba(245, 158, 11, 0.45)', bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', glow: 'rgba(245, 158, 11, 0.2)' },
    error: { border: 'rgba(244, 63, 94, 0.45)', bg: 'rgba(244, 63, 94, 0.15)', text: '#f43f5e', glow: 'rgba(244, 63, 94, 0.2)' },
    info: { border: 'rgba(56, 189, 248, 0.45)', bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.2)' }
  };
  const theme = colorMap[type] || colorMap.info;

  const iconMap = {
    success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  };

  const iconSvg = iconMap[type] || iconMap.info;

  toast.style.cssText = `
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: rgba(13, 17, 23, 0.96);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${theme.border};
    border-radius: 12px;
    box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.8), 0 0 20px -4px ${theme.glow};
    color: #f1f5f9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(-12px) scale(0.97);
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
    box-sizing: border-box;
  `;

  toast.innerHTML = `
    <div class="app-toast-icon" style="width:32px;height:32px;border-radius:8px;background:${theme.bg};border:1px solid ${theme.border};color:${theme.text};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      ${iconSvg}
    </div>
    <div class="app-toast-body" style="flex:1;min-width:0;">
      ${title ? `<div class="app-toast-title" style="font-size:0.84rem;font-weight:700;color:#ffffff;line-height:1.2;margin-bottom:0.15rem;letter-spacing:-0.01em;">${title}</div>` : ''}
      <div class="app-toast-message" style="font-size:0.77rem;color:#94a3b8;line-height:1.4;word-break:break-word;">${message}</div>
    </div>
    <button type="button" class="app-toast-close" aria-label="Close notification" style="background:transparent;border:none;color:#64748b;cursor:pointer;padding:0.25rem;line-height:1;display:flex;align-items:center;justify-content:center;border-radius:6px;flex-shrink:0;transition:color 0.15s ease;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;

  const closeBtn = toast.querySelector('.app-toast-close');
  if (closeBtn) {
    closeBtn.onmouseenter = () => { closeBtn.style.color = '#ffffff'; };
    closeBtn.onmouseleave = () => { closeBtn.style.color = '#64748b'; };
  }
  let dismissTimeout = null;

  const dismiss = () => {
    if (dismissTimeout) clearTimeout(dismissTimeout);
    toast.classList.remove('show');
    toast.classList.add('hide');
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px) scale(0.96)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 240);
  };

  closeBtn.addEventListener('click', dismiss);
  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';
  });

  if (duration > 0) {
    dismissTimeout = setTimeout(dismiss, duration);
  }

  return { dismiss };
}
window.showAppToast = showAppToast;

/**
 * Display modal confirmation dialog returning a Promise<boolean>
 * Replaces native confirm() with sleek custom UI
 */
function showAppConfirm(options = {}) {
  const {
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger'
  } = options;

  return new Promise((resolve) => {
    // Remove any lingering confirm dialogs to prevent duplication
    const existing = document.querySelectorAll('.app-dialog-backdrop');
    existing.forEach(el => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });

    const backdrop = document.createElement('div');
    backdrop.className = 'app-dialog-backdrop';

    const iconMap = {
      danger: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      warning: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      info: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    const confirmBtnClass = type === 'danger' ? 'confirm-danger' : 'confirm-primary';
    const confirmBtnIcon = type === 'danger'
      ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>'
      : '';

    backdrop.innerHTML = `
      <div class="app-dialog-card" role="dialog" aria-modal="true">
        <div class="app-dialog-header">
          <div class="app-dialog-icon ${type}">${iconMap[type] || iconMap.danger}</div>
          <div style="flex: 1; min-width: 0;">
            <h3 class="app-dialog-title">${title}</h3>
            <p class="app-dialog-message">${message}</p>
          </div>
        </div>
        <div class="app-dialog-actions">
          <button type="button" class="app-dialog-btn cancel" id="app-dialog-cancel-btn">${cancelText}</button>
          <button type="button" class="app-dialog-btn ${confirmBtnClass}" id="app-dialog-confirm-btn">${confirmBtnIcon}${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    const cancelBtn = backdrop.querySelector('#app-dialog-cancel-btn');
    const confirmBtn = backdrop.querySelector('#app-dialog-confirm-btn');
    const card = backdrop.querySelector('.app-dialog-card');

    requestAnimationFrame(() => {
      backdrop.classList.add('open');
      if (cancelBtn) cancelBtn.focus();
    });

    let resolved = false;
    const cleanup = (result) => {
      if (resolved) return;
      resolved = true;
      window.removeEventListener('keydown', handleKeyDown);

      backdrop.classList.remove('open');
      if (card) {
        card.style.transform = 'scale(0.92) translateY(10px)';
        card.style.opacity = '0';
      }

      setTimeout(() => {
        if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      }, 250);
      resolve(result);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cleanup(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    confirmBtn.addEventListener('click', () => cleanup(true));
    cancelBtn.addEventListener('click', () => cleanup(false));
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) cleanup(false);
    });
  });
}
window.showAppConfirm = showAppConfirm;

// Gracefully override window.alert so even legacy or inline HTML onclick="alert(...)" calls render as sleek in-app toasts
window.alert = function(msg) {
  if (typeof msg !== 'string') msg = String(msg || '');
  let type = 'info';
  let title = 'Checklist Fx';

  if (msg.startsWith('✓') || msg.toLowerCase().includes('success') || msg.toLowerCase().includes('saved') || msg.toLowerCase().includes('synced') || msg.toLowerCase().includes('committed')) {
    type = 'success';
    title = 'Success';
  } else if (msg.startsWith('⚠') || msg.toLowerCase().includes('violation') || msg.toLowerCase().includes('breach') || msg.toLowerCase().includes('warning') || msg.toLowerCase().includes('note:')) {
    type = 'warning';
    title = 'Trading Rule Notice';
  } else if (msg.toLowerCase().includes('error') || msg.toLowerCase().includes('failed')) {
    type = 'error';
    title = 'Error';
  }

  const parts = msg.split('\n\n');
  if (parts.length > 1) {
    title = parts[0].replace(/^[✓⚠✗ℹ]\s*/, '').trim();
    msg = parts.slice(1).join('\n\n').trim();
  } else {
    msg = msg.replace(/^[✓⚠✗ℹ]\s*/, '').trim();
  }

  showAppToast({ title, message: msg, type, duration: 4500 });
};

// ==========================================================================
// GLOBAL USER PREFERENCES & PERSISTENCE
// ==========================================================================
function getUserPreferences() {
  try {
    const raw = localStorage.getItem('dma_user_preferences');
    if (raw) return JSON.parse(raw);
  } catch (_) {}

  let detectedTz = 'Africa/Lagos';
  try {
    const sysTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (sysTz) detectedTz = sysTz;
  } catch (_) {}

  return {
    name: 'Jason Trader',
    handle: '@jasondma',
    timezone: detectedTz,
    style: 'Momentum + Breakout',
    currency: 'USD',
    accountSize: 100000,
    riskPerTrade: 1.0,
    notifications: true,
    darkMode: true,
    riskReminders: true
  };
}
window.getUserPreferences = getUserPreferences;

// Supported Global Forex & Trading Currencies
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'Fr ',
  NGN: '₦',
  ZAR: 'R ',
  INR: '₹',
  SGD: 'S$',
  NZD: 'NZ$',
  AED: 'AED '
};
window.CURRENCY_SYMBOLS = CURRENCY_SYMBOLS;

// Default Trading Accounts Archetypes
const DEFAULT_ACCOUNTS = [
  { id: 'acc_funded_100k', name: 'Funded Prop', size: 100000, risk: 1.0, currency: 'USD' },
  { id: 'acc_personal_10k', name: 'Personal Live', size: 10000, risk: 2.0, currency: 'USD' },
  { id: 'acc_challenge_50k', name: 'Challenge Phase 1', size: 50000, risk: 1.0, currency: 'USD' }
];

function getTradingAccounts() {
  try {
    const raw = localStorage.getItem('dma_trading_accounts');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return DEFAULT_ACCOUNTS;
}
window.getTradingAccounts = getTradingAccounts;

function saveTradingAccounts(accounts) {
  try {
    localStorage.setItem('dma_trading_accounts', JSON.stringify(accounts));
    if (window.DMA_DB && typeof window.DMA_DB.savePreferences === 'function') {
      window.DMA_DB.savePreferences({ accounts });
    }
    window.dispatchEvent(new CustomEvent('dma-accounts-updated', { detail: accounts }));
  } catch (err) {
    console.warn('Failed to save trading accounts:', err);
  }
}
window.saveTradingAccounts = saveTradingAccounts;

function getAppCurrency() {
  try {
    const prefs = getUserPreferences();
    if (prefs && prefs.currency) {
      return {
        code: prefs.currency,
        symbol: CURRENCY_SYMBOLS[prefs.currency] || '$'
      };
    }
  } catch (_) {}
  return { code: 'USD', symbol: '$' };
}
window.getAppCurrency = getAppCurrency;

function formatMoney(amount, options = {}) {
  const num = Number(amount) || 0;
  const curr = options.currencySymbol || getAppCurrency().symbol;
  const decimals = options.decimals !== undefined ? options.decimals : 2;
  const absFormatted = Math.abs(num).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  if (options.noSign) {
    return `${curr}${absFormatted}`;
  }
  if (num > 0) {
    return `+${curr}${absFormatted}`;
  }
  if (num < 0) {
    return `-${curr}${absFormatted}`;
  }
  return `${curr}${absFormatted}`;
}
window.formatMoney = formatMoney;

function populateAccountSelects(preferredId) {
  const accounts = getTradingAccounts();
  const selectElements = document.querySelectorAll('#log-account-select');

  selectElements.forEach(select => {
    const currentVal = preferredId || select.value || accounts[0]?.id;
    select.innerHTML = '';

    accounts.forEach(acc => {
      const opt = document.createElement('option');
      opt.value = acc.id;
      const sym = CURRENCY_SYMBOLS[acc.currency] || '$';
      const kLabel = acc.size >= 1000 ? `${Math.round(acc.size / 1000)}k` : `${acc.size}`;
      opt.setAttribute('data-name', `${acc.name} (${sym}${kLabel})`);
      opt.setAttribute('data-size', acc.size);
      opt.setAttribute('data-risk', acc.risk);
      opt.setAttribute('data-currency', acc.currency || 'USD');

      const riskAmt = Math.round(acc.size * (acc.risk / 100));
      opt.textContent = `${acc.name} (${sym}${Number(acc.size).toLocaleString()} · ${acc.risk}% = ${sym}${riskAmt.toLocaleString()})`;
      select.appendChild(opt);
    });

    const customOpt = document.createElement('option');
    customOpt.value = '__custom_account__';
    customOpt.textContent = '+ Add / Edit Custom Account...';
    select.appendChild(customOpt);

    if (currentVal && Array.from(select.options).some(o => o.value === currentVal)) {
      select.value = currentVal;
    } else if (select.options.length > 0) {
      select.selectedIndex = 0;
    }
  });

  // Also update journal account filter pills if present
  const filterGroup = document.getElementById('adv-filter-account');
  if (filterGroup) {
    const activePillVal = filterGroup.querySelector('.pill.active')?.getAttribute('data-val') || 'all';
    filterGroup.innerHTML = '<button class="pill" data-val="all">All Accounts</button>';
    accounts.forEach(acc => {
      const btn = document.createElement('button');
      btn.className = 'pill';
      btn.setAttribute('data-val', acc.id);
      const sym = CURRENCY_SYMBOLS[acc.currency] || '$';
      const kLabel = acc.size >= 1000 ? `${Math.round(acc.size / 1000)}k` : `${acc.size}`;
      btn.textContent = `${acc.name} (${sym}${kLabel})`;
      filterGroup.appendChild(btn);
    });
    const targetPill = filterGroup.querySelector(`[data-val="${activePillVal}"]`) || filterGroup.querySelector('[data-val="all"]');
    if (targetPill) targetPill.classList.add('active');
  }
}
window.populateAccountSelects = populateAccountSelects;

function saveUserPreferences(prefs) {
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem('dma_user_preferences', JSON.stringify(updated));
    if (window.DMA_DB && typeof window.DMA_DB.savePreferences === 'function') {
      window.DMA_DB.savePreferences(updated);
    }
    window.dispatchEvent(new CustomEvent('dma-preferences-updated', { detail: updated }));
    return updated;
  } catch (err) {
    console.warn('Failed to save preferences:', err);
  }
}
window.saveUserPreferences = saveUserPreferences;

document.addEventListener('DOMContentLoaded', () => {
  // Ensure legacy sample data preference is pruned for a completely clean slate
  try {
    localStorage.removeItem('dma_include_sample_data');
  } catch (_) {}

  // Universal route resolver: works on localhost, Live Server, GitHub Pages, custom domains, subpaths, clean URLs, and local files
  function resolveRouteUrl(rawTarget) {
    if (!rawTarget) return '';
    if (rawTarget.startsWith('http://') || rawTarget.startsWith('https://') || rawTarget.startsWith('mailto:') || rawTarget.startsWith('#')) {
      return rawTarget;
    }
    const target = rawTarget.split('?')[0].split('#')[0];
    const search = rawTarget.includes('?') ? '?' + rawTarget.split('?')[1].split('#')[0] : '';
    const hash = rawTarget.includes('#') ? '#' + rawTarget.split('#')[1] : '';

    let cleanName = target.split('/').filter(Boolean).pop() || '';
    cleanName = cleanName.toLowerCase().replace(/\.html$/i, '');
    if (cleanName === 'index' || target === '/' || target === '') {
      cleanName = '';
    }

    const isFile = window.location.protocol === 'file:';
    const host = window.location.hostname || '';
    const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local');
    const isGitHubPages = host.endsWith('github.io');
    const currentHasHtml = window.location.pathname.toLowerCase().endsWith('.html');

    // Use .html extension if on local/static hosts or if the current page itself is using .html
    const useHtml = isFile || isLocalhost || isGitHubPages || currentHasHtml;

    if (isFile) {
      const fileName = cleanName ? `${cleanName}.html` : 'index.html';
      return fileName + search + hash;
    }

    const currentUrl = new URL(window.location.href);
    const basePath = currentUrl.pathname.replace(/\/+$/, '').replace(/\/[^/]*$/, '') || '';

    let targetPath = '';
    if (useHtml) {
      const fileName = cleanName ? `${cleanName}.html` : 'index.html';
      targetPath = `/${fileName}`;
    } else {
      targetPath = cleanName ? `/${cleanName}` : '/';
    }

    return `${currentUrl.origin}${basePath}${targetPath}${search}${hash}`;
  }
  window.resolveRouteUrl = resolveRouteUrl;

  function navigateToRoute(rawTarget, replace = false) {
    if (!rawTarget) return;
    const finalUrl = resolveRouteUrl(rawTarget);
    if (!finalUrl) return;

    if (rawTarget.startsWith('http://') || rawTarget.startsWith('https://') || rawTarget.startsWith('mailto:') || rawTarget.startsWith('#')) {
      if (replace) window.location.replace(finalUrl);
      else window.location.href = finalUrl;
      return;
    }

    const currentUrl = new URL(window.location.href);
    const targetUrl = new URL(finalUrl, window.location.href);

    // If already on the exact same page path, simply close drawer and don't reload
    const currentClean = currentUrl.pathname.replace(/\.html$/i, '').replace(/\/+$/, '') || '/';
    const targetClean = targetUrl.pathname.replace(/\.html$/i, '').replace(/\/+$/, '') || '/';
    if (currentClean === targetClean && currentUrl.origin === targetUrl.origin && (!targetUrl.hash || targetUrl.hash === currentUrl.hash)) {
      document.body.classList.remove('nav-open');
      return;
    }

    if (replace) {
      window.location.replace(finalUrl);
    } else {
      window.location.href = finalUrl;
    }
  }
  window.DMA_NAVIGATE = navigateToRoute;

  // Intercept all route links, route buttons, and drawer links
  document.querySelectorAll('a.drawer-link, a[data-route], button[data-route], [data-route], .drawer-action-btn').forEach((el) => {
    const rawTarget = el.getAttribute('data-route') || el.getAttribute('href');
    if (!rawTarget || rawTarget.startsWith('http') || rawTarget.startsWith('mailto:') || rawTarget.startsWith('#')) return;

    el.addEventListener('click', (event) => {
      event.preventDefault();
      navigateToRoute(rawTarget);
    });
  });

  const menuButton = document.querySelector('[data-action="menu"]');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const drawerOverlay = document.getElementById('drawer-overlay');

  const toggleNav = () => {
    document.body.classList.toggle('nav-open');
  };

  if (menuButton) {
    menuButton.addEventListener('click', toggleNav);
  }
  
  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', toggleNav);
  }
  
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', toggleNav);
  }

  const profileButton = document.querySelector('[data-action="profile"]');
  if (profileButton) {
    profileButton.addEventListener('click', () => {
      navigateToRoute('profile');
    });
  }

  const drawerUserInfo = document.getElementById('drawer-user-info');
  if (drawerUserInfo) {
    drawerUserInfo.onclick = (e) => {
      e.preventDefault();
      navigateToRoute('profile');
    };
  }

  // ==========================================================================
  // PROFILE & USER CONTEXT ENGINE (WITH PERSISTENT PREFERENCES & STATS)
  // ==========================================================================

  // Calculate and sync dynamic profile statistics from real trades
  function syncProfileStats() {
    const winRateEl = document.getElementById('profile-stat-winrate');
    const tradesEl = document.getElementById('profile-stat-trades');
    const bestSetupEl = document.getElementById('profile-stat-best-setup');
    if (!winRateEl && !tradesEl && !bestSetupEl) return;

    let trades = [];
    try {
      trades = JSON.parse(localStorage.getItem('dma_trades') || '[]');
    } catch (_) {}

    const total = trades.length;
    if (total === 0) {
      if (winRateEl) winRateEl.textContent = '--%';
      if (tradesEl) tradesEl.textContent = '0';
      if (bestSetupEl) bestSetupEl.textContent = '--';
      return;
    }

    let wins = 0;
    const stratStats = {};

    trades.forEach(t => {
      const pnl = Number(t.pnl) || 0;
      const isWin = pnl > 0;
      if (isWin) wins++;

      const strat = t.strategy || (t.strategyKey ? (t.strategyKey === 'trend' ? 'Trend Continuation' : (t.strategyKey === 'impulse' ? 'Impulse Entry' : 'A+ Reversal')) : 'Systematic Setup');
      if (!stratStats[strat]) {
        stratStats[strat] = { total: 0, wins: 0, pnl: 0 };
      }
      stratStats[strat].total++;
      if (isWin) stratStats[strat].wins++;
      stratStats[strat].pnl += pnl;
    });

    const winRate = Math.round((wins / total) * 100);

    // Find best setup by highest win rate (and positive PnL)
    let bestSetup = '--';
    let bestRate = -1;
    let highestPnl = -Infinity;

    Object.entries(stratStats).forEach(([name, stat]) => {
      const rate = (stat.wins / stat.total) * 100;
      if (rate > bestRate || (rate === bestRate && stat.pnl > highestPnl)) {
        bestRate = rate;
        highestPnl = stat.pnl;
        bestSetup = name;
      }
    });

    if (winRateEl) winRateEl.textContent = `${winRate}%`;
    if (tradesEl) tradesEl.textContent = String(total);
    if (bestSetupEl) bestSetupEl.textContent = bestSetup;
  }

  // Sync Firebase / active user to side drawer, headers, and profile screen
  function syncGlobalUserContext() {
    const prefs = getUserPreferences();
    let user = null;
    if (typeof window.DMA_AUTH !== 'undefined') {
      user = window.DMA_AUTH.getUser();
    }
    if (!user) {
      try {
        user = JSON.parse(localStorage.getItem('dma_active_user') || localStorage.getItem('dma_user') || 'null');
      } catch (_) {}
    }

    const email = user?.email || 'trader@dma.com';
    const name = prefs.name || user?.user_metadata?.full_name || email.split('@')[0] || 'Trader';
    const handle = prefs.handle || user?.user_metadata?.handle || ('@' + email.split('@')[0]);
    const timezone = prefs.timezone || 'America/New_York';
    const style = prefs.style || 'Momentum + Breakout';
    const initials = name.slice(0, 2).toUpperCase();

    // Drawer and profile avatars & headers
    document.querySelectorAll('#drawer-user-avatar, #profile-avatar').forEach(el => el.textContent = initials);
    document.querySelectorAll('#drawer-user-name, #profile-name-display').forEach(el => el.textContent = name);
    document.querySelectorAll('#drawer-user-email, #profile-email-display').forEach(el => el.textContent = handle);

    // Profile page specific elements
    const timezoneDisplay = document.getElementById('profile-timezone-display');
    const styleDisplay = document.getElementById('profile-style-display');
    const styleBadge = document.getElementById('profile-style-badge');

    if (timezoneDisplay) timezoneDisplay.textContent = timezone;
    if (styleDisplay) styleDisplay.textContent = style;
    if (styleBadge) styleBadge.textContent = style;

    // Sync modal fields
    const inputName = document.getElementById('profile-name');
    const inputHandle = document.getElementById('profile-handle');
    const selectTimezone = document.getElementById('profile-timezone');
    const selectStyle = document.getElementById('profile-style');

    if (inputName) inputName.value = name;
    if (inputHandle) inputHandle.value = handle;
    if (selectTimezone) {
      let found = false;
      for (let i = 0; i < selectTimezone.options.length; i++) {
        if (selectTimezone.options[i].value === timezone) {
          found = true;
          break;
        }
      }
      if (!found && timezone) {
        const opt = document.createElement('option');
        opt.value = timezone;
        opt.textContent = `${timezone} (Local)`;
        selectTimezone.appendChild(opt);
      }
      selectTimezone.value = timezone;
    }
    if (selectStyle) selectStyle.value = style;

    // Sync Currency & Account Context
    const selectCurrency = document.getElementById('profile-currency') || document.getElementById('profile-currency-select');
    const inputAccountSize = document.getElementById('profile-account-size');
    const inputRiskPct = document.getElementById('profile-risk-pct');
    const displayAccount = document.getElementById('profile-account-display') || document.getElementById('profile-active-account-display');

    const accounts = getTradingAccounts();
    const primaryAcc = accounts[0] || { name: 'Funded Prop', size: 100000, risk: 1.0, currency: 'USD' };
    const baseCurr = prefs.currency || primaryAcc.currency || 'USD';
    const sym = CURRENCY_SYMBOLS[baseCurr] || '$';

    if (selectCurrency) selectCurrency.value = baseCurr;
    if (inputAccountSize) inputAccountSize.value = prefs.accountSize || primaryAcc.size || 100000;
    if (inputRiskPct) inputRiskPct.value = prefs.riskPerTrade || primaryAcc.risk || 1.0;
    if (displayAccount) {
      const accSize = prefs.accountSize || primaryAcc.size || 100000;
      const accRisk = prefs.riskPerTrade || primaryAcc.risk || 1.0;
      displayAccount.textContent = `${sym}${Number(accSize).toLocaleString()} (${baseCurr} · ${accRisk}% Risk)`;
    }

    // Sync toggles
    const toggleNotif = document.getElementById('setting-toggle-notifications');
    const toggleDark = document.getElementById('setting-toggle-darkmode');
    const toggleRisk = document.getElementById('setting-toggle-risk');
    if (toggleNotif && prefs.notifications !== undefined) toggleNotif.checked = prefs.notifications;
    if (toggleDark && prefs.darkMode !== undefined) toggleDark.checked = prefs.darkMode;
    if (toggleRisk && prefs.riskReminders !== undefined) toggleRisk.checked = prefs.riskReminders;

    // Refresh dynamic stats
    syncProfileStats();
  }

  syncGlobalUserContext();
  window.addEventListener('dma-auth-changed', syncGlobalUserContext);
  window.addEventListener('dma-data-synced', syncGlobalUserContext);
  window.addEventListener('dma-preferences-updated', syncGlobalUserContext);
  window.addEventListener('storage', syncGlobalUserContext);

  // Settings Toggles Listener
  document.getElementById('setting-toggle-notifications')?.addEventListener('change', (e) => {
    saveUserPreferences({ notifications: e.target.checked });
  });
  document.getElementById('setting-toggle-darkmode')?.addEventListener('change', (e) => {
    saveUserPreferences({ darkMode: e.target.checked });
  });
  document.getElementById('setting-toggle-risk')?.addEventListener('change', (e) => {
    saveUserPreferences({ riskReminders: e.target.checked });
  });

  // Profile Modal & Editor
  const profileModal = document.getElementById('profile-modal');

  const openProfileEditor = () => {
    if (!profileModal) return;
    syncGlobalUserContext(); // Pre-populate with freshest state
    profileModal.classList.remove('hidden');
    profileModal.setAttribute('aria-hidden', 'false');
  };

  const closeProfileEditor = () => {
    if (!profileModal) return;
    profileModal.classList.add('hidden');
    profileModal.setAttribute('aria-hidden', 'true');
  };

  document.querySelectorAll('[data-action="open-profile-editor"]').forEach(btn => {
    btn.addEventListener('click', openProfileEditor);
  });

  document.querySelectorAll('[data-action="close-profile-editor"]').forEach(btn => {
    btn.addEventListener('click', closeProfileEditor);
  });

  if (profileModal) {
    profileModal.addEventListener('click', (event) => {
      if (event.target === profileModal) closeProfileEditor();
    });
  }

  const saveProfileButton = document.querySelector('[data-action="save-profile-editor"]');
  if (saveProfileButton) {
    saveProfileButton.addEventListener('click', () => {
      const nextName = document.getElementById('profile-name')?.value.trim() || 'Jason Trader';
      const rawHandle = document.getElementById('profile-handle')?.value.trim() || '@jasondma';
      const nextHandle = rawHandle.startsWith('@') ? rawHandle : '@' + rawHandle;
      const nextTimezone = document.getElementById('profile-timezone')?.value || 'Africa/Lagos';
      const nextStyle = document.getElementById('profile-style')?.value || 'Momentum + Breakout';
      const nextCurrency = document.getElementById('profile-currency')?.value || getUserPreferences().currency || 'USD';
      const nextAccountSize = parseFloat(document.getElementById('profile-account-size')?.value) || getUserPreferences().accountSize || 100000;
      const nextRiskPct = parseFloat(document.getElementById('profile-risk-pct')?.value) || getUserPreferences().riskPerTrade || 1.0;

      const accounts = getTradingAccounts();
      if (accounts.length > 0) {
        accounts[0].size = nextAccountSize;
        accounts[0].risk = nextRiskPct;
        accounts[0].currency = nextCurrency;
        saveTradingAccounts(accounts);
      }

      saveUserPreferences({
        name: nextName,
        handle: nextHandle,
        timezone: nextTimezone,
        style: nextStyle,
        currency: nextCurrency,
        accountSize: nextAccountSize,
        riskPerTrade: nextRiskPct
      });

      syncGlobalUserContext();
      closeProfileEditor();

      // Show sleek confirmation toast
      const toast = document.createElement('div');
      toast.className = 'profile-saved-toast';
      toast.textContent = '✓ Profile & timezone saved successfully';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    });
  }

  // Profile Logout Handler
  const profileLogoutBtn = document.getElementById('profile-logout-btn');
  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      profileLogoutBtn.disabled = true;
      profileLogoutBtn.textContent = 'Logging out...';
      if (window.DMA_AUTH && typeof window.DMA_AUTH.signOut === 'function') {
        await window.DMA_AUTH.signOut();
      } else {
        localStorage.removeItem('checklist-auth');
        localStorage.removeItem('dma_active_user');
      }
      if (typeof navigateToRoute === 'function') {
        navigateToRoute('login');
      } else if (typeof window.resolveRouteUrl === 'function') {
        window.location.href = window.resolveRouteUrl('login');
      } else {
        window.location.href = 'login.html';
      }
    });
  }

  const authForms = document.querySelectorAll('[data-auth-form]');
  authForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      localStorage.setItem('checklist-auth', 'true');
      const redir = form.dataset.redirect || 'app';
      if (typeof navigateToRoute === 'function') {
        navigateToRoute(redir);
      } else if (typeof window.resolveRouteUrl === 'function') {
        window.location.href = window.resolveRouteUrl(redir);
      } else {
        window.location.href = `${redir}.html`;
      }
    });
  });

  const appButtons = document.querySelectorAll('[data-app-action]');
  appButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-app-action');

      if (action === 'new-trade') {
        if (typeof openLogTradeModal === 'function') {
          openLogTradeModal();
        }
      }

      if (action === 'new-checklist') {
        if (typeof openChecklistCreatorModal === 'function') {
          openChecklistCreatorModal();
        }
      }
    });
  });

  // Allow the dashboard to open in preview mode without forcing a login redirect.
  // The login/signup pages remain available for the product flow when needed.

  // ==========================================================================
  // DASHBOARD DYNAMIC LEDGER METRICS
  // ==========================================================================
  function initDashboardModule() {
    const netPnlEl = document.getElementById('dashboard-net-pnl');
    if (!netPnlEl) return;

    const labelFollowed = document.getElementById('dashboard-followed-pnl');
    const labelBroken = document.getElementById('dashboard-broken-pnl');
    const barGood = document.getElementById('dashboard-bar-good');
    const barBad = document.getElementById('dashboard-bar-bad');

    function updateDashboardMetrics() {
      let customTrades = [];
      try {
        customTrades = JSON.parse(localStorage.getItem('dma_trades') || '[]');
      } catch (_) {}

      let totalNet = 0;
      let totalFollowed = 0;
      let totalBroken = 0;

      customTrades.forEach(t => {
        const pnl = Number(t.pnl) || 0;
        totalNet += pnl;
        if (t.isCompliant) {
          totalFollowed += (pnl > 0 ? pnl : 0);
        } else {
          totalBroken += (pnl < 0 ? pnl : 0);
        }
      });

      const hasTrades = customTrades.length > 0;

      if (netPnlEl) {
        if (!hasTrades) {
          netPnlEl.textContent = formatMoney(0, { noSign: true });
          netPnlEl.className = 'net-pnl neutral';
        } else {
          netPnlEl.textContent = formatMoney(totalNet);
          netPnlEl.className = `net-pnl ${totalNet >= 0 ? 'green' : 'red'}`;
        }
      }

      if (labelFollowed) {
        labelFollowed.textContent = formatMoney(totalFollowed);
      }

      if (labelBroken) {
        labelBroken.textContent = formatMoney(-Math.abs(totalBroken));
      }

      if (barGood && barBad) {
        const absFollowed = Math.abs(totalFollowed);
        const absBroken = Math.abs(totalBroken);
        const denom = absFollowed + absBroken;
        if (denom === 0) {
          barGood.style.width = '100%';
          barBad.style.width = '0%';
        } else {
          const goodPct = Math.round((absFollowed / denom) * 100);
          barGood.style.width = `${goodPct}%`;
          barBad.style.width = `${100 - goodPct}%`;
        }
      }

      // Dynamic Guardian Capital Shield HUD
      const hudWr = document.getElementById('guardian-hud-wr');
      const hudWrSub = document.getElementById('guardian-hud-wr-sub');
      const hudDiscipline = document.getElementById('guardian-hud-discipline');
      const hudDisciplineSub = document.getElementById('guardian-hud-discipline-sub');

      if (hudWr) {
        if (!hasTrades) {
          hudWr.textContent = '--% WR';
          hudWr.className = 'pillar-val gold';
          if (hudWrSub) hudWrSub.textContent = '0 Trades Logged';
          if (hudDiscipline) hudDiscipline.textContent = 'STRICT GATES';
          if (hudDisciplineSub) hudDisciplineSub.textContent = 'Zero FOMO';
        } else {
          let wins = 0;
          let compliantCount = 0;
          customTrades.forEach(t => {
            if (Number(t.pnl) > 0) wins++;
            if (t.isCompliant) compliantCount++;
          });
          const totalCustom = customTrades.length;
          const wr = totalCustom > 0 ? Math.round((wins / totalCustom) * 100) : 0;
          const compRate = totalCustom > 0 ? Math.round((compliantCount / totalCustom) * 100) : 100;
          hudWr.textContent = `+${wr}% WR`;
          hudWr.className = `pillar-val ${wr >= 50 ? 'gold' : 'cyan'}`;
          if (hudWrSub) hudWrSub.textContent = `${wins}/${totalCustom} Wins (${compRate}% Rules)`;
          if (hudDiscipline) hudDiscipline.textContent = `${compRate}% DISCIPLINE`;
          if (hudDisciplineSub) hudDisciplineSub.textContent = 'Active Ledger';
        }
      }

      // Refresh dashboard playbooks if on app.html
      if (typeof window.renderDashboardPlaybooks === 'function') {
        window.renderDashboardPlaybooks();
      }
    }

    window.updateDashboardMetrics = updateDashboardMetrics;
    updateDashboardMetrics();
    window.addEventListener('dma-auth-changed', updateDashboardMetrics);
    window.addEventListener('storage', updateDashboardMetrics);
  }
  initDashboardModule();
});

  // ==========================================================================
  // COMPREHENSIVE JOURNAL ENGINE: SEARCH, DATE SCRUBBING, METRICS & INSPECTOR
  // ==========================================================================
  function initJournalModule() {
    const journalList = document.getElementById('journal-trade-list');
    if (!journalList) return;

    // Filter State
    let activeTab = 'all'; // 'all' | 'followed' | 'broken'
    let activeDateFilter = 'all'; // 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'
    let activeCalFilteredDate = null; // YYYY-MM-DD when clicked in calendar
    let searchQuery = '';
    let advFilters = {
      asset: 'all',
      direction: 'all',
      setup: 'all',
      account: 'all',
      date: 'all',
      customFrom: null,
      customTo: null
    };

    // 1. Render custom trades from localStorage
    function buildTradeCard(t, dateAttr) {
      const card = document.createElement('div');
      const isWin = Number(t.pnl) >= 0;
      const pnlNum = Number(t.pnl) || 0;
      const tradeSym = t.currencySymbol || (t.currency && CURRENCY_SYMBOLS[t.currency]) || getAppCurrency().symbol;
      const pnlFormatted = formatMoney(pnlNum, { currencySymbol: tradeSym });
      const rMult = t.rMultiple || (isWin ? '+2.2R' : '-1.0R');
      const strategyTitle = t.strategy || (t.strategyKey === 'trend' ? 'Trend Continuation' : (t.strategyKey === 'impulse' ? 'Impulse Entry' : 'A+ Reversal'));

      const userTz = (typeof getUserPreferences === 'function' ? getUserPreferences().timezone : 'Africa/Lagos');
      let displayTime = t.date || 'Today';
      if (t.timestamp) {
        try {
          displayTime = new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: userTz });
        } catch (_) {}
      }

      card.className = `trade-card ${t.isCompliant ? 'followed' : 'broken'}`;
      card.setAttribute('data-trade-id', t.id || Date.now());
      card.setAttribute('data-asset', t.asset || 'XAUUSD');
      card.setAttribute('data-direction', (t.direction || 'long').toLowerCase());
      card.setAttribute('data-setup', t.strategyKey || 'reversal');
      card.setAttribute('data-date', dateAttr);
      card.setAttribute('data-time', displayTime);
      card.setAttribute('data-timestamp', t.timestamp || Date.now());
      card.setAttribute('data-pnl', pnlNum);
      card.setAttribute('data-rmult', rMult);
      card.setAttribute('data-compliance', t.isCompliant ? 'true' : 'false');
      card.setAttribute('data-confluences-met', t.confluencesMet || (t.isCompliant ? 4 : 1));
      card.setAttribute('data-confluences-total', t.totalConfluences || 4);
      card.setAttribute('data-account-id', t.accountId || 'acc_funded_100k');
      card.setAttribute('data-account-name', t.accountName || 'Funded Prop ($100k)');
      card.setAttribute('data-pnl-percent', t.pnlPercent ? (t.pnlPercent > 0 ? `+${t.pnlPercent}` : `${t.pnlPercent}`) : '');

      // Debrief & Retrospective info
      let debrief = t.debrief || null;
      if (!debrief) {
        try {
          const storedDebriefs = JSON.parse(localStorage.getItem('dma_trade_debriefs') || '{}');
          debrief = storedDebriefs[t.id] || null;
        } catch (_) {}
      }
      if (!debrief) {
        debrief = {
          grade: t.isCompliant ? 'A+' : 'F',
          title: t.isCompliant ? 'Flawless Discipline' : 'Rule Breach',
          emotion: t.isCompliant ? 'Calm & Patient' : (t.breachReason || 'FOMO'),
          exitQuality: 'Target Hit',
          lessons: t.notes || ''
        };
      }
      card.setAttribute('data-debrief', JSON.stringify(debrief));

      const gradeLetter = (debrief.grade || 'A').charAt(0).toLowerCase();
      const gradeBadgeHtml = `<span class="trade-debrief-badge grade-${gradeLetter}">${debrief.grade}</span>`;
      
      const rawTags = [];
      if (t.accountName) rawTags.push(t.accountName);
      if (debrief.emotion) rawTags.push(debrief.emotion);
      if (t.isCompliant) {
        rawTags.push('Rules Followed');
      } else if (t.breachReason && t.breachReason !== debrief.emotion) {
        rawTags.push(t.breachReason);
      } else if (!t.isCompliant) {
        rawTags.push('Rules Broken');
      }
      if (debrief.exitQuality && !debrief.exitQuality.includes('Target Hit')) {
        rawTags.push(debrief.exitQuality);
      }
      const tags = [...new Set(rawTags.filter(Boolean))];
      card.setAttribute('data-tags', JSON.stringify(tags));

      const defaultConfluences = t.isCompliant 
        ? ['4H Key S/R Level or Liquidity Pool swept', '15M Market Structure Shift (MSS) verified', 'Order Block or FVG retest established', 'Strict risk:reward parameters maintained']
        : ['4H Key S/R Level or Liquidity Pool swept (MISSED)', '15M Market Structure Shift (MISSED)', 'Order Block or FVG retest (MISSED)', t.breachReason ? `Rule breach: ${t.breachReason}` : 'Chased price prematurely'];
      card.setAttribute('data-confluences', JSON.stringify(t.confluences && t.confluences.length > 0 ? t.confluences : defaultConfluences));

      if (t.screenshotUrl) {
        card.setAttribute('data-screenshot', t.screenshotUrl);
      }
      card.setAttribute('data-notes', t.notes || (t.isCompliant ? 'Executed with 100% adherence to trading playbook.' : `Execution violated discipline rules: ${t.breachReason || 'FOMO chase'}`));

      const tagBadgesHtml = tags.map(tag => `<span class="psych-tag ${t.isCompliant ? 'good' : 'bad'}">${tag}</span>`).join(' ');

      const screenshotActionHtml = t.screenshotUrl ? `
        <div class="trade-screenshot-action">
          <a href="${t.screenshotUrl}" target="_blank" rel="noopener noreferrer" class="btn-view-trade-chart" title="Open TradingView Screenshot" onclick="event.stopPropagation();">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span>VIEW TRADINGVIEW SCREENSHOT</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
      ` : '';

      const lessonsText = debrief.lessons || (t.retrospective || (t.notes && !t.notes.includes('100% adherence') && !t.notes.includes('Rule breach') ? t.notes : ''));
      const retrospectiveHtml = lessonsText ? `<div class="trade-retrospective-snippet">"${lessonsText}"</div>` : '';

      const pnlPctDisplay = t.pnlPercent !== undefined && t.pnlPercent !== null && t.pnlPercent !== '' ? ` (${Number(t.pnlPercent) > 0 ? '+' : ''}${t.pnlPercent}%)` : '';

      card.innerHTML = `
        <div class="trade-header">
          <div class="trade-asset">
            <span class="direction ${(t.direction || 'long').toLowerCase()}">${(t.direction || 'long').toUpperCase()}</span>
            <span class="ticker">${t.asset || 'XAUUSD'}</span>
            ${gradeBadgeHtml}
          </div>
          <div class="trade-pnl-wrap" style="text-align: right;">
            <div class="trade-pnl ${isWin ? 'win' : 'loss'}">${pnlFormatted}</div>
            <div class="trade-pnl-sub" style="font-size: 0.72rem; font-family: var(--font-mono); color: var(--ink-muted);">${rMult}${pnlPctDisplay}</div>
          </div>
        </div>
        <div class="trade-meta">
          <span class="time">${displayTime}</span>
          <span class="setup-name">${strategyTitle}</span>
          <span class="trade-account-pill">${t.accountName || 'Funded Prop ($100k)'}</span>
        </div>
        <div class="trade-tags">
          ${tagBadgesHtml}
        </div>
        ${retrospectiveHtml}
        <div class="trade-footer">
          <span class="discipline-badge ${t.isCompliant ? 'green' : 'red'}">
            ${t.isCompliant ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Rules Followed' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Rules Broken'}
          </span>
          <span class="confluences">${t.confluencesMet || (t.isCompliant ? 4 : 1)}/${t.totalConfluences || 4} Confluences</span>
        </div>
        ${screenshotActionHtml}
      `;
      return card;
    }

    let lastRenderedJournalHash = '';

    function renderAllJournalTrades(force = false) {
      try {
        const customTrades = JSON.parse(localStorage.getItem('dma_trades') || '[]');
        const currentHash = JSON.stringify(customTrades.map(t => [t.id, t.pnl, t.asset, t.isCompliant, t.timestamp]));
        if (!force && (journalList.children?.length || 0) > 0 && lastRenderedJournalHash === currentHash) {
          return; // Skip destructive wipe if data has not changed
        }
        lastRenderedJournalHash = currentHash;

        journalList.innerHTML = '';
        if (customTrades.length > 0) {
          const groups = {};
          const groupOrder = [];

          const sortedTrades = [...customTrades].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          const now = new Date();
          const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const yDate = new Date(now.getTime() - 86400000);
          const yestKey = `${yDate.getFullYear()}-${String(yDate.getMonth() + 1).padStart(2, '0')}-${String(yDate.getDate()).padStart(2, '0')}`;

          sortedTrades.forEach(t => {
            let dKey = todayKey;
            if (t.timestamp) {
              const d = new Date(t.timestamp);
              dKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
            if (!groups[dKey]) {
              groups[dKey] = [];
              groupOrder.push(dKey);
            }
            groups[dKey].push(t);
          });

          groupOrder.forEach(dKey => {
            let label = dKey;
            if (dKey === todayKey) label = 'Today';
            else if (dKey === yestKey) label = 'Yesterday';
            else {
              const parts = dKey.split('-');
              const dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
              label = dObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
            }

            const header = document.createElement('div');
            header.className = 'date-group-header';
            header.innerHTML = `<span>${label}</span><span class="date-group-stat"></span>`;
            journalList.appendChild(header);

            groups[dKey].forEach(t => {
              const dateAttr = dKey === todayKey ? 'today' : (dKey === yestKey ? 'yesterday' : 'past');
              const card = buildTradeCard(t, dateAttr);
              journalList.appendChild(card);
            });
          });
        }
      } catch (err) {
        console.warn('Could not load custom trades into journal', err);
      }

      // Attach saved debrief badges to all trade cards
      try {
        const storedDebriefs = JSON.parse(localStorage.getItem('dma_trade_debriefs') || '{}');
        journalList.querySelectorAll('.trade-card').forEach(card => {
          const tid = card.getAttribute('data-trade-id');
          if (tid && storedDebriefs[tid]) {
            const deb = storedDebriefs[tid];
            card.setAttribute('data-debrief', JSON.stringify(deb));
            let b = card.querySelector('.trade-debrief-badge');
            const gradeLetter = (deb.grade || 'A').charAt(0).toLowerCase();
            if (!b) {
              b = document.createElement('span');
              b.className = `trade-debrief-badge grade-${gradeLetter}`;
              const footerEl = card.querySelector('.trade-footer');
              if (footerEl) footerEl.appendChild(b);
            } else {
              b.className = `trade-debrief-badge grade-${gradeLetter}`;
            }
            b.textContent = `Grade: ${deb.grade}`;
          }
        });
      } catch (_) {}

      applyAllJournalFilters();
      if (typeof renderCalendarHeatmap === 'function') {
        renderCalendarHeatmap();
      }
    }

    // Helper: Normalize trade card date to YYYY-MM-DD
    function getTradeDateKey(card) {
      const rawTimestamp = Number(card.getAttribute('data-timestamp'));
      if (rawTimestamp) {
        const d = new Date(rawTimestamp);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      const cardDateAttr = card.getAttribute('data-date');
      const now = new Date();
      if (cardDateAttr === 'yesterday') {
        const y = new Date(now.getTime() - 86400000);
        return `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
      }
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    function matchDate(card, filterType, customFrom, customTo) {
      if (filterType === 'all') return true;

      const cardDateAttr = card.getAttribute('data-date');
      const rawTimestamp = Number(card.getAttribute('data-timestamp'));
      const tradeDate = rawTimestamp ? new Date(rawTimestamp) : (cardDateAttr === 'yesterday' ? new Date(Date.now() - 86400000) : new Date());

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const startOfYesterday = startOfToday - 86400000;
      const endOfYesterday = startOfToday - 1;
      const past7Days = now.getTime() - (7 * 86400000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

      if (filterType === 'today') {
        if (cardDateAttr === 'today') return true;
        return tradeDate.getTime() >= startOfToday;
      }

      if (filterType === 'yesterday') {
        if (cardDateAttr === 'yesterday') return true;
        return tradeDate.getTime() >= startOfYesterday && tradeDate.getTime() <= endOfYesterday;
      }

      if (filterType === 'week') {
        if (cardDateAttr === 'today' || cardDateAttr === 'yesterday') return true;
        return tradeDate.getTime() >= past7Days;
      }

      if (filterType === 'month') {
        if (cardDateAttr === 'today' || cardDateAttr === 'yesterday') return true;
        return tradeDate.getTime() >= startOfMonth;
      }

      if (filterType === 'custom') {
        const tTime = tradeDate.getTime();
        if (customFrom) {
          const fromTime = new Date(customFrom + 'T00:00:00').getTime();
          if (tTime < fromTime) return false;
        }
        if (customTo) {
          const toTime = new Date(customTo + 'T23:59:59').getTime();
          if (tTime > toTime) return false;
        }
        return true;
      }

      return true;
    }

    function applyAllJournalFilters() {
      const cards = journalList.querySelectorAll('.trade-card');
      const q = searchQuery.toLowerCase().trim();

      let visibleCount = 0;
      let followedCount = 0;
      let brokenCount = 0;
      let netPnl = 0;
      let winCount = 0;
      let lossCount = 0;
      let fomoTax = 0;

      cards.forEach(card => {
        const asset = (card.getAttribute('data-asset') || '').toLowerCase();
        const direction = (card.getAttribute('data-direction') || '').toLowerCase();
        const setup = (card.getAttribute('data-setup') || '').toLowerCase();
        const setupName = (card.querySelector('.setup-name')?.textContent || '').toLowerCase();
        const notes = (card.getAttribute('data-notes') || '').toLowerCase();
        const tags = (card.getAttribute('data-tags') || '').toLowerCase();
        const compliance = card.getAttribute('data-compliance') === 'true' || card.classList.contains('followed');
        const pnl = parseFloat(card.getAttribute('data-pnl')) || 0;

        let matchTab = true;
        if (activeTab === 'followed') matchTab = compliance;
        if (activeTab === 'broken') matchTab = !compliance;

        let matchSearch = true;
        if (q) {
          const combined = `${asset} ${direction} ${setup} ${setupName} ${notes} ${tags}`;
          matchSearch = combined.includes(q);
        }

        let matchDateFilter = matchDate(card, activeDateFilter, advFilters.customFrom, advFilters.customTo);

        let matchAdv = true;
        if (advFilters.asset !== 'all' && asset !== advFilters.asset.toLowerCase()) matchAdv = false;
        if (advFilters.direction !== 'all' && direction !== advFilters.direction.toLowerCase()) matchAdv = false;
        if (advFilters.setup !== 'all' && setup !== advFilters.setup.toLowerCase()) matchAdv = false;
        if (advFilters.account !== 'all' && (card.getAttribute('data-account-id') || 'acc_funded_100k') !== advFilters.account) matchAdv = false;
        let matchCalDate = true;
        if (activeCalFilteredDate) {
          matchCalDate = getTradeDateKey(card) === activeCalFilteredDate;
        }

        const tradeId = card.getAttribute('data-trade-id') || '';
        if (tradeId.startsWith('demo-')) {
          card.style.display = 'none';
          return;
        }

        const isVisible = matchTab && matchSearch && matchDateFilter && matchAdv && matchCalDate;

        if (isVisible) {
          card.style.display = 'flex';
          visibleCount++;
          if (compliance) followedCount++; else brokenCount++;
          netPnl += pnl;
          if (pnl >= 0) winCount++; else lossCount++;
          if (!compliance && pnl < 0) fomoTax += Math.abs(pnl);
        } else {
          card.style.display = 'none';
        }
      });

      const countAllEl = document.getElementById('count-all');
      const countFollowedEl = document.getElementById('count-followed');
      const countBrokenEl = document.getElementById('count-broken');
      
      if (countAllEl) countAllEl.textContent = (followedCount + brokenCount);
      if (countFollowedEl) countFollowedEl.textContent = followedCount;
      if (countBrokenEl) countBrokenEl.textContent = brokenCount;

      const netPnlEl = document.getElementById('journal-net-pnl');
      const tradesCountEl = document.getElementById('journal-trades-count');
      const winRateEl = document.getElementById('journal-win-rate');
      const winLossCountEl = document.getElementById('journal-win-loss-count');
      const disciplineEl = document.getElementById('journal-discipline-rate');
      const fomoTaxEl = document.getElementById('journal-fomo-tax');

      if (netPnlEl) {
        if (visibleCount === 0) {
          netPnlEl.textContent = formatMoney(0, { noSign: true });
          netPnlEl.className = 'digest-val';
        } else {
          netPnlEl.textContent = formatMoney(netPnl);
          netPnlEl.className = `digest-val ${netPnl >= 0 ? 'green' : 'red'}`;
        }
      }

      if (tradesCountEl) {
        tradesCountEl.textContent = visibleCount === 1 ? '1 Trade Logged' : `${visibleCount} Trades Logged`;
      }

      if (winRateEl) {
        if (visibleCount === 0) {
          winRateEl.textContent = '--%';
          winRateEl.className = 'digest-val';
        } else {
          const wr = Math.round((winCount / visibleCount) * 100);
          winRateEl.textContent = `${wr}%`;
          winRateEl.className = `digest-val ${wr >= 50 ? 'cyan' : 'red'}`;
        }
      }

      if (winLossCountEl) {
        winLossCountEl.textContent = `${winCount}W · ${lossCount}L`;
      }

      if (disciplineEl) {
        if (visibleCount === 0) {
          disciplineEl.textContent = '--%';
          disciplineEl.className = 'digest-val';
        } else {
          const discRate = Math.round((followedCount / visibleCount) * 100);
          disciplineEl.textContent = `${discRate}%`;
          disciplineEl.className = `digest-val ${discRate >= 80 ? 'green' : (discRate >= 50 ? 'cyan' : 'red')}`;
        }
      }

      if (fomoTaxEl) {
        fomoTaxEl.textContent = fomoTax > 0 
          ? formatMoney(-Math.abs(fomoTax)) 
          : formatMoney(0, { noSign: true });
      }

      updateDateHeaders();
      handleEmptyState(visibleCount);
    }

    function updateDateHeaders() {
      const headers = journalList.querySelectorAll('.date-group-header');
      headers.forEach(header => {
        let sibling = header.nextElementSibling;
        let hasVisible = false;
        let groupNet = 0;
        let groupCount = 0;

        while (sibling && !sibling.classList.contains('date-group-header')) {
          if (sibling.classList.contains('trade-card') && sibling.style.display !== 'none') {
            hasVisible = true;
            groupCount++;
            groupNet += (parseFloat(sibling.getAttribute('data-pnl')) || 0);
          }
          sibling = sibling.nextElementSibling;
        }

        header.style.display = hasVisible ? 'flex' : 'none';
        const statEl = header.querySelector('.date-group-stat');
        if (statEl && hasVisible) {
          const formattedNet = formatMoney(groupNet);
          const colorClass = groupNet >= 0 ? 'green' : 'red';
          statEl.innerHTML = `Net: <b class="${colorClass}">${formattedNet}</b> · ${groupCount} trade${groupCount === 1 ? '' : 's'}`;
        }
      });
    }


    function handleEmptyState(visibleCount) {
      let emptyState = document.getElementById('journal-empty-state');
      if (visibleCount === 0) {
        if (!emptyState) {
          emptyState = document.createElement('div');
          emptyState.id = 'journal-empty-state';
          emptyState.className = 'journal-empty-state';
          emptyState.innerHTML = `
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--ink-muted); margin-bottom: 0.75rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h4>No Trades Found</h4>
            <p>No logged trades match the selected criteria, or you haven't logged any trades yet.</p>
            <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 0.5rem; flex-wrap: wrap;">
              <button type="button" class="btn btn-primary" id="empty-log-trade-btn" style="padding: 0.45rem 0.9rem; font-size: 0.78rem;">Log Trade</button>
              <button type="button" class="btn btn-ghost" id="empty-reset-filters-btn" style="padding: 0.45rem 0.9rem; font-size: 0.78rem;">Reset Filters</button>
            </div>
          `;
          journalList.appendChild(emptyState);
          document.getElementById('empty-reset-filters-btn')?.addEventListener('click', resetAllFilters);
          document.getElementById('empty-log-trade-btn')?.addEventListener('click', () => {
            if (typeof openLogTradeModal === 'function') {
              openLogTradeModal();
            } else {
              const modal = document.getElementById('log-trade-modal');
              const backdrop = document.getElementById('log-trade-backdrop');
              if (modal && backdrop) {
                modal.classList.add('open');
                backdrop.classList.add('open');
                document.body.style.overflow = 'hidden';
              }
            }
          });
        }
      } else {
        if (emptyState) emptyState.remove();
      }
    }

    function resetAllFilters() {
      activeTab = 'all';
      activeDateFilter = 'all';
      searchQuery = '';
      advFilters = { asset: 'all', direction: 'all', setup: 'all', account: 'all', date: 'all', customFrom: null, customTo: null };

      const searchInputEl = document.getElementById('journal-search-input');
      const clearBtnEl = document.getElementById('clear-search-btn');
      if (searchInputEl) searchInputEl.value = '';
      if (clearBtnEl) clearBtnEl.style.display = 'none';

      document.querySelectorAll('.journal-tabs .tab-btn').forEach((t, idx) => {
        t.classList.toggle('active', idx === 0);
      });

      document.querySelectorAll('#quick-date-pills .date-pill').forEach((p, idx) => {
        p.classList.toggle('active', idx === 0);
      });

      document.querySelectorAll('#adv-filter-sheet .pill-group').forEach(group => {
        const pills = group.querySelectorAll('.pill');
        pills.forEach((p, idx) => p.classList.toggle('active', idx === 0));
      });
      const customWrap = document.getElementById('adv-custom-date-wrap');
      if (customWrap) customWrap.style.display = 'none';
      const dateFrom = document.getElementById('adv-date-from');
      const dateTo = document.getElementById('adv-date-to');
      if (dateFrom) dateFrom.value = '';
      if (dateTo) dateTo.value = '';

      applyAllJournalFilters();
    }

    // Tab buttons
    const tabs = document.querySelectorAll('.journal-tabs .tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.getAttribute('data-filter') || 'all';
        applyAllJournalFilters();
      });
    });

    // Search input & Clear
    const searchInput = document.getElementById('journal-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        }
        applyAllJournalFilters();
      });
    }
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        clearSearchBtn.style.display = 'none';
        searchQuery = '';
        applyAllJournalFilters();
      });
    }

    // Quick Date Filter Pills
    const quickDatePills = document.querySelectorAll('#quick-date-pills .date-pill');
    quickDatePills.forEach(pill => {
      pill.addEventListener('click', () => {
        quickDatePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeDateFilter = pill.getAttribute('data-date-filter') || 'all';

        const sheetDatePills = document.querySelectorAll('#adv-filter-date .pill');
        sheetDatePills.forEach(sp => {
          sp.classList.toggle('active', sp.getAttribute('data-val') === activeDateFilter);
        });

        applyAllJournalFilters();
      });
    });

    // Advanced Filter Sheet
    const mainFilterBtn = document.getElementById('main-filter-btn');
    const advFilterOverlay = document.getElementById('adv-filter-overlay');
    const closeAdvFilterBtn = document.getElementById('close-adv-filter-btn');
    const applyAdvFilterBtn = document.getElementById('apply-adv-filter-btn');
    const resetAdvFilterBtn = document.getElementById('reset-adv-filter-btn');

    const toggleFilterSheet = () => {
      document.body.classList.toggle('filter-open');
    };

    if (mainFilterBtn) mainFilterBtn.addEventListener('click', toggleFilterSheet);
    if (closeAdvFilterBtn) closeAdvFilterBtn.addEventListener('click', toggleFilterSheet);
    if (advFilterOverlay) advFilterOverlay.addEventListener('click', toggleFilterSheet);

    document.querySelectorAll('#adv-filter-sheet .pill-group').forEach(group => {
      const pills = group.querySelectorAll('.pill');
      pills.forEach(pill => {
        pill.addEventListener('click', () => {
          pills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');

          if (group.id === 'adv-filter-date') {
            const val = pill.getAttribute('data-val');
            const customWrap = document.getElementById('adv-custom-date-wrap');
            if (customWrap) {
              customWrap.style.display = val === 'custom' ? 'grid' : 'none';
            }
          }
        });
      });
    });

    if (applyAdvFilterBtn) {
      applyAdvFilterBtn.addEventListener('click', () => {
        advFilters.asset = document.querySelector('#adv-filter-asset .pill.active')?.getAttribute('data-val') || 'all';
        advFilters.direction = document.querySelector('#adv-filter-direction .pill.active')?.getAttribute('data-val') || 'all';
        advFilters.setup = document.querySelector('#adv-filter-setup .pill.active')?.getAttribute('data-val') || 'all';
        advFilters.account = document.querySelector('#adv-filter-account .pill.active')?.getAttribute('data-val') || 'all';

        const sheetDateVal = document.querySelector('#adv-filter-date .pill.active')?.getAttribute('data-val') || 'all';
        activeDateFilter = sheetDateVal;
        advFilters.date = sheetDateVal;

        if (sheetDateVal === 'custom') {
          advFilters.customFrom = document.getElementById('adv-date-from')?.value || null;
          advFilters.customTo = document.getElementById('adv-date-to')?.value || null;
        } else {
          advFilters.customFrom = null;
          advFilters.customTo = null;
        }

        quickDatePills.forEach(qp => {
          qp.classList.toggle('active', qp.getAttribute('data-date-filter') === sheetDateVal);
        });

        toggleFilterSheet();
        applyAllJournalFilters();
      });
    }

    if (resetAdvFilterBtn) {
      resetAdvFilterBtn.addEventListener('click', () => {
        resetAllFilters();
        toggleFilterSheet();
      });
    }

    // Trade Inspector Modal Setup
    const inspectorModal = document.getElementById('trade-inspector-modal');
    const inspectorBackdrop = document.getElementById('trade-inspector-backdrop');
    const closeInspectorBtn = document.getElementById('close-inspector-btn');
    const inspectorDoneBtn = document.getElementById('inspector-done-btn');
    const deleteTradeBtn = document.getElementById('inspector-delete-trade-btn');

    let currentInspectedCard = null;
    let currentInspectedTradeId = null;

    function closeTradeInspector() {
      if (inspectorModal) {
        inspectorModal.classList.remove('open');
        inspectorModal.setAttribute('aria-hidden', 'true');
      }
      if (inspectorBackdrop) inspectorBackdrop.classList.remove('open');
      currentInspectedCard = null;
      currentInspectedTradeId = null;
    }

    if (closeInspectorBtn) closeInspectorBtn.addEventListener('click', closeTradeInspector);
    if (inspectorDoneBtn) inspectorDoneBtn.addEventListener('click', closeTradeInspector);
    if (inspectorBackdrop) inspectorBackdrop.addEventListener('click', closeTradeInspector);

    function openTradeInspector(card) {
      if (!inspectorModal || !card) return;
      currentInspectedCard = card;
      currentInspectedTradeId = card.getAttribute('data-trade-id');

      const asset = card.getAttribute('data-asset') || 'XAUUSD';
      const direction = (card.getAttribute('data-direction') || 'long').toLowerCase();
      const pnl = parseFloat(card.getAttribute('data-pnl')) || 0;
      const isWin = pnl >= 0;
      const rmult = card.getAttribute('data-rmult') || (isWin ? '+2.2R' : '-1.0R');
      const isCompliant = card.getAttribute('data-compliance') === 'true' || card.classList.contains('followed');
      const setupName = card.querySelector('.setup-name')?.textContent || card.getAttribute('data-setup') || 'A+ Playbook Setup';
      const timeText = card.querySelector('.time')?.textContent || card.getAttribute('data-time') || 'Today';
      const notes = card.getAttribute('data-notes') || 'No additional retrospective notes recorded for this trade.';
      const screenshot = card.getAttribute('data-screenshot') || card.querySelector('.btn-view-trade-chart')?.getAttribute('href');

      let tags = [];
      try {
        tags = JSON.parse(card.getAttribute('data-tags') || '[]');
      } catch (_) {
        card.querySelectorAll('.psych-tag').forEach(t => tags.push(t.textContent.trim()));
      }
      if (tags.length === 0) {
        tags = isCompliant ? ['Rules Followed', 'Disciplined'] : ['Rules Broken', 'FOMO'];
      }

      let confluences = [];
      try {
        confluences = JSON.parse(card.getAttribute('data-confluences') || '[]');
      } catch (_) {}
      if (confluences.length === 0) {
        confluences = isCompliant
          ? ['4H Key S/R Level or Liquidity Pool swept', '15M Market Structure Shift (MSS) verified', 'Order Block or FVG retest established', 'Strict minimum Risk-to-Reward met']
          : ['4H Key S/R Level or Liquidity Pool swept (MISSED)', '15M Market Structure Shift (MISSED)', 'Order Block or FVG retest (MISSED)', 'Impulse breakout entered without confirmation'];
      }

      const assetTitleEl = document.getElementById('inspector-asset-title');
      const dirBadgeEl = document.getElementById('inspector-direction-badge');
      const pnlValEl = document.getElementById('inspector-pnl-val');
      const rmultValEl = document.getElementById('inspector-rmult-val');
      const compBadgeEl = document.getElementById('inspector-compliance-badge');
      const setupNameEl = document.getElementById('inspector-setup-name');
      const timeStampEl = document.getElementById('inspector-time-stamp');
      const tagsContainerEl = document.getElementById('inspector-tags');
      const gatesCountEl = document.getElementById('inspector-gates-count');
      const gatesListEl = document.getElementById('inspector-gates-list');
      const tvPreviewEl = document.getElementById('inspector-tv-preview');
      const tvUrlTextEl = document.getElementById('inspector-tv-url-text');
      const openTvBtnEl = document.getElementById('inspector-open-tv-btn');
      const notesBoxEl = document.getElementById('inspector-notes-box');

      if (assetTitleEl) assetTitleEl.textContent = asset;
      if (dirBadgeEl) {
        dirBadgeEl.textContent = direction.toUpperCase();
        dirBadgeEl.className = `direction ${direction}`;
      }

      if (pnlValEl) {
        pnlValEl.textContent = formatMoney(pnl);
        pnlValEl.className = `inspector-pnl-val ${isWin ? 'green' : 'red'}`;
      }

      if (rmultValEl) {
        const pnlPct = card.getAttribute('data-pnl-percent');
        const accName = card.getAttribute('data-account-name');
        let rmultText = `${rmult} Realized`;
        if (pnlPct) {
          rmultText += ` (${pnlPct}%)`;
        }
        if (accName) {
          rmultText += ` · ${accName}`;
        }
        rmultValEl.textContent = rmultText;
      }

      if (compBadgeEl) {
        compBadgeEl.className = `inspector-compliance-badge ${isCompliant ? 'green' : 'red'}`;
        compBadgeEl.innerHTML = isCompliant
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 100% Rules Followed'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Rules Broken';
      }

      if (setupNameEl) setupNameEl.textContent = setupName;
      if (timeStampEl) timeStampEl.textContent = timeText;

      if (tagsContainerEl) {
        const uniqueTags = [...new Set(tags.filter(Boolean))];
        tagsContainerEl.innerHTML = uniqueTags.map(tag => `<span class="psych-tag ${isCompliant ? 'good' : 'bad'}">${tag}</span>`).join(' ');
      }

      const metCount = card.getAttribute('data-confluences-met') || (isCompliant ? confluences.length : 1);
      const totalCount = card.getAttribute('data-confluences-total') || confluences.length;
      if (gatesCountEl) gatesCountEl.textContent = `${metCount}/${totalCount}`;

      if (gatesListEl) {
        gatesListEl.innerHTML = confluences.map(c => {
          let text = '';
          let isMet = false;
          if (typeof c === 'object' && c !== null) {
            text = c.text || '';
            isMet = Boolean(c.met);
          } else if (typeof c === 'string') {
            if (c.includes('(MISSED)')) {
              text = c.replace(/\s*\(MISSED\)$/i, '').trim();
              isMet = false;
            } else {
              text = c.trim();
              isMet = true;
            }
          }
          return `
            <div class="inspector-gate-item">
              <span class="gate-status-icon ${isMet ? 'met' : 'broken'}">${isMet ? '✓' : '✕'}</span>
              <span>${text}${isMet ? '' : ' <span class="gate-missed-tag">(MISSED)</span>'}</span>
            </div>
          `;
        }).join('');
      }

      if (tvPreviewEl) {
        if (screenshot && screenshot.trim().length > 0) {
          tvPreviewEl.style.display = 'block';
          if (tvUrlTextEl) tvUrlTextEl.textContent = screenshot;
          if (openTvBtnEl) openTvBtnEl.href = screenshot;
        } else {
          tvPreviewEl.style.display = 'none';
        }
      }

      if (notesBoxEl) notesBoxEl.textContent = notes;

      // Populate Inspector Debrief Card
      let debriefData = null;
      try {
        const storedDebriefs = JSON.parse(localStorage.getItem('dma_trade_debriefs') || '{}');
        debriefData = storedDebriefs[currentInspectedTradeId] || (card.getAttribute('data-debrief') ? JSON.parse(card.getAttribute('data-debrief')) : null);
      } catch (_) {}

      const debriefGradePill = document.getElementById('inspector-debrief-grade-pill');
      const debriefTitle = document.getElementById('inspector-debrief-title');
      const debriefSub = document.getElementById('inspector-debrief-sub');
      const debriefLessons = document.getElementById('inspector-debrief-lessons');
      const debriefBtnText = document.getElementById('inspector-debrief-btn-text');

      if (debriefData) {
        const gradeLetter = (debriefData.grade || 'A').charAt(0).toLowerCase();
        if (debriefGradePill) {
          debriefGradePill.textContent = debriefData.grade;
          debriefGradePill.className = `grade-avatar grade-${gradeLetter}`;
        }
        if (debriefTitle) debriefTitle.textContent = debriefData.title || `Grade: ${debriefData.grade}`;
        if (debriefSub) debriefSub.textContent = `${debriefData.emotion || 'Calm & Patient'} · ${debriefData.exitQuality || 'Target Hit'}`;
        if (debriefLessons) debriefLessons.textContent = debriefData.lessons || 'No specific retrospective notes recorded.';
        if (debriefBtnText) debriefBtnText.textContent = 'Edit Debrief';
      } else {
        if (debriefGradePill) {
          debriefGradePill.textContent = '—';
          debriefGradePill.className = 'grade-avatar';
        }
        if (debriefTitle) debriefTitle.textContent = 'Not Audited Yet';
        if (debriefSub) debriefSub.textContent = 'Rate execution discipline & emotional state';
        if (debriefLessons) debriefLessons.textContent = 'No post-session debrief recorded for this trade.';
        if (debriefBtnText) debriefBtnText.textContent = 'Audit / Grade Trade';
      }

      inspectorModal.classList.add('open');
      inspectorModal.setAttribute('aria-hidden', 'false');
      if (inspectorBackdrop) inspectorBackdrop.classList.add('open');
    }

    journalList.addEventListener('click', (e) => {
      if (e.target.closest('.trade-screenshot-action') || e.target.closest('.btn-view-trade-chart')) {
        return;
      }
      const card = e.target.closest('.trade-card');
      if (card) {
        openTradeInspector(card);
      }
    });

    if (deleteTradeBtn) {
      deleteTradeBtn.addEventListener('click', async () => {
        if (!currentInspectedCard) return;
        const confirmed = await showAppConfirm({
          title: 'Delete Trade from Journal?',
          message: 'Are you sure you want to delete this trade from your journal?\n\nThis will permanently remove the record and update your net P&L and performance metrics.',
          confirmText: 'Delete Trade',
          cancelText: 'Cancel',
          type: 'danger'
        });
        if (!confirmed) return;

        const tradeId = currentInspectedTradeId;
        const targetCard = currentInspectedCard;

        // 1. Instantly close inspector modal smoothly
        closeTradeInspector();

        // 2. Animate card removal in journal list
        if (targetCard) {
          targetCard.style.transition = 'all 0.26s cubic-bezier(0.16, 1, 0.3, 1)';
          targetCard.style.opacity = '0';
          targetCard.style.transform = 'translateX(-20px) scale(0.96)';
          targetCard.style.pointerEvents = 'none';
          setTimeout(() => {
            targetCard.remove();
            applyAllJournalFilters();
          }, 260);
        }

        // 3. Update localStorage for trades and debriefs
        try {
          const stored = JSON.parse(localStorage.getItem('dma_trades') || '[]');
          const updated = stored.filter(t => String(t.id) !== String(tradeId));
          localStorage.setItem('dma_trades', JSON.stringify(updated));

          const storedDebriefs = JSON.parse(localStorage.getItem('dma_trade_debriefs') || '{}');
          if (storedDebriefs[tradeId]) {
            delete storedDebriefs[tradeId];
            localStorage.setItem('dma_trade_debriefs', JSON.stringify(storedDebriefs));
          }
        } catch (err) {
          console.warn('Could not remove trade from storage', err);
        }

        // 4. Delete from Cloud Firestore backend
        if (window.DMA_DB && typeof window.DMA_DB.deleteTrade === 'function') {
          window.DMA_DB.deleteTrade(tradeId);
        }

        // 5. Update filters, KPIs, and calendar heatmap immediately
        applyAllJournalFilters();
        if (typeof renderCalendarHeatmap === 'function') {
          renderCalendarHeatmap();
        }
        if (typeof window.updateDashboardMetrics === 'function') {
          window.updateDashboardMetrics();
        }

        showAppToast({
          title: 'Trade Deleted',
          message: 'The trade has been removed from your journal and metrics.',
          type: 'info'
        });
      });
    }

    // CSV Export Engine
    const exportCsvBtn = document.getElementById('export-csv-btn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const cards = journalList.querySelectorAll('.trade-card');
        if (cards.length === 0) {
          showAppToast({
            title: 'Export Unavailable',
            message: 'No trades available in the journal to export.',
            type: 'info'
          });
          return;
        }

        const headers = ['Trade ID', 'Date/Time', 'Asset', 'Direction', 'Setup', 'Outcome', 'PnL ($)', 'R-Multiple', 'Compliance', 'Confluences Met', 'Total Confluences', 'TradingView Screenshot', 'Notes'];
        const rows = [headers.join(',')];

        cards.forEach(card => {
          const id = `"${(card.getAttribute('data-trade-id') || '').replace(/"/g, '""')}"`;
          const time = `"${(card.querySelector('.time')?.textContent || card.getAttribute('data-time') || '').replace(/"/g, '""')}"`;
          const asset = `"${(card.getAttribute('data-asset') || '').replace(/"/g, '""')}"`;
          const direction = `"${(card.getAttribute('data-direction') || '').toUpperCase()}"`;
          const setup = `"${(card.querySelector('.setup-name')?.textContent || card.getAttribute('data-setup') || '').replace(/"/g, '""')}"`;
          const pnl = parseFloat(card.getAttribute('data-pnl')) || 0;
          const outcome = pnl >= 0 ? '"WIN"' : '"LOSS"';
          const pnlVal = `"${pnl}"`;
          const rmult = `"${(card.getAttribute('data-rmult') || '').replace(/"/g, '""')}"`;
          const compliance = card.getAttribute('data-compliance') === 'true' || card.classList.contains('followed') ? '"FOLLOWED"' : '"BROKEN"';
          const met = `"${card.getAttribute('data-confluences-met') || ''}"`;
          const total = `"${card.getAttribute('data-confluences-total') || ''}"`;
          const screenshot = `"${(card.getAttribute('data-screenshot') || card.querySelector('.btn-view-trade-chart')?.getAttribute('href') || '').replace(/"/g, '""')}"`;
          const notes = `"${(card.getAttribute('data-notes') || '').replace(/"/g, '""')}"`;

          rows.push([id, time, asset, direction, setup, outcome, pnlVal, rmult, compliance, met, total, screenshot, notes].join(','));
        });

        const csvBlob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(csvBlob);
        const downloadLink = document.createElement('a');
        const todayStr = new Date().toISOString().slice(0, 10);
        downloadLink.href = downloadUrl;
        downloadLink.download = `dma-trade-journal-${todayStr}.csv`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
      });
    }

    // ==========================================================================
    // VIEW SWITCHER: LIST VIEW VS CALENDAR HEATMAP
    // ==========================================================================
    const viewToggleList = document.getElementById('view-toggle-list');
    const viewToggleCalendar = document.getElementById('view-toggle-calendar');
    const calendarCard = document.getElementById('journal-calendar-card');

    if (viewToggleList && viewToggleCalendar && calendarCard) {
      viewToggleList.addEventListener('click', () => {
        viewToggleList.classList.add('active');
        viewToggleCalendar.classList.remove('active');
        calendarCard.style.display = 'none';
      });

      viewToggleCalendar.addEventListener('click', () => {
        viewToggleCalendar.classList.add('active');
        viewToggleList.classList.remove('active');
        calendarCard.style.display = 'block';
        renderCalendarHeatmap();
      });
    }

    // ==========================================================================
    // CALENDAR HEATMAP ENGINE
    // ==========================================================================
    let currentCalDate = new Date(); // Tracks viewing month & year
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    function renderCalendarHeatmap() {
      const grid = document.getElementById('calendar-grid');
      const titleEl = document.getElementById('cal-month-title');
      const monthNetEl = document.getElementById('cal-month-net');
      const monthDiscEl = document.getElementById('cal-month-discipline');
      if (!grid) return;

      const year = currentCalDate.getFullYear();
      const month = currentCalDate.getMonth(); // 0-indexed

      if (titleEl) titleEl.textContent = `${monthNames[month]} ${year}`;

      // Aggregate all cards in journal
      const allCards = journalList.querySelectorAll('.trade-card');
      const tradesByDate = {};
      let monthTotalNet = 0;
      let monthCompliantCount = 0;
      let monthTradeCount = 0;

      allCards.forEach(card => {
        const tid = card.getAttribute('data-trade-id') || '';
        if (tid.startsWith('demo-')) return;

        const dateKey = getTradeDateKey(card);
        const pnl = parseFloat(card.getAttribute('data-pnl')) || 0;
        const isCompliant = card.getAttribute('data-compliance') === 'true' || card.classList.contains('followed');

        if (!tradesByDate[dateKey]) {
          tradesByDate[dateKey] = { net: 0, count: 0, compliant: 0, broken: 0 };
        }
        tradesByDate[dateKey].net += pnl;
        tradesByDate[dateKey].count += 1;
        if (isCompliant) tradesByDate[dateKey].compliant += 1;
        else tradesByDate[dateKey].broken += 1;

        // Check if date belongs to this calendar month
        const parts = dateKey.split('-');
        if (parseInt(parts[0], 10) === year && (parseInt(parts[1], 10) - 1) === month) {
          monthTotalNet += pnl;
          monthTradeCount += 1;
          if (isCompliant) monthCompliantCount += 1;
        }
      });

      if (monthNetEl) {
        if (monthTradeCount === 0) {
          monthNetEl.innerHTML = `Month Net: <b style="color: var(--ink-muted);">$0.00</b>`;
        } else {
          const fNet = monthTotalNet >= 0 
            ? `+$${monthTotalNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
            : `-$${Math.abs(monthTotalNet).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          monthNetEl.innerHTML = `Month Net: <b style="color: ${monthTotalNet >= 0 ? 'var(--success)' : 'var(--danger)'};">${fNet}</b>`;
        }
      }
      if (monthDiscEl) {
        if (monthTradeCount === 0) {
          monthDiscEl.innerHTML = `Discipline: <b style="color: var(--ink-muted);">--%</b>`;
        } else {
          const discRate = Math.round((monthCompliantCount / monthTradeCount) * 100);
          monthDiscEl.innerHTML = `Discipline: <b style="color: ${discRate >= 80 ? 'var(--success)' : (discRate >= 50 ? 'var(--cyan)' : 'var(--danger)')};">${discRate}%</b>`;
        }
      }

      // First day of month (Monday=0: (day + 6) % 7)
      const firstDay = new Date(year, month, 1);
      const startDayOfWeek = (firstDay.getDay() + 6) % 7;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const prevMonthDays = new Date(year, month, 0).getDate();
      const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

      grid.innerHTML = '';

      // Previous month filler days
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell other-month';
        cell.innerHTML = `<span class="cal-day-num">${prevMonthDays - i}</span>`;
        grid.appendChild(cell);
      }

      // Current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = dayKey === todayStr;
        const data = tradesByDate[dayKey];

        let cellClasses = ['calendar-day-cell'];
        if (isToday) cellClasses.push('is-today');
        if (activeCalFilteredDate === dayKey) cellClasses.push('active-filtered');

        if (data && data.count > 0) {
          cellClasses.push('has-trades');
          cellClasses.push(data.net >= 0 ? 'win-day' : 'loss-day');
          const isAllCompliant = data.broken === 0;
          const indicatorClass = isAllCompliant ? 'shield' : 'breach';

          const fPnl = data.net >= 0 
            ? `+$${Math.round(data.net)}` 
            : `-$${Math.round(Math.abs(data.net))}`;

          cell.innerHTML = `
            <div class="cal-day-header">
              <span class="cal-day-num">${day}</span>
              <span class="cal-day-indicator ${indicatorClass}" title="${isAllCompliant ? '100% Plan Adherence' : `${data.broken} Rule Breach(es)`}"></span>
            </div>
            <div class="cal-day-content">
              <div class="cal-day-pnl ${data.net >= 0 ? 'green' : 'red'}">${fPnl}</div>
              <div class="cal-day-trades">${data.count} Trd</div>
            </div>
          `;

          cell.addEventListener('click', () => {
            selectCalendarDay(dayKey, data, day, monthNames[month], year);
          });
        } else {
          cell.innerHTML = `
            <div class="cal-day-header">
              <span class="cal-day-num">${day}</span>
            </div>
          `;
        }

        cell.className = cellClasses.join(' ');
        grid.appendChild(cell);
      }

      // Next month filler days to complete grid row
      const totalCells = startDayOfWeek + daysInMonth;
      const trailingCells = (7 - (totalCells % 7)) % 7;
      for (let nextDay = 1; nextDay <= trailingCells; nextDay++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell other-month';
        cell.innerHTML = `<span class="cal-day-num">${nextDay}</span>`;
        grid.appendChild(cell);
      }
    }

    function selectCalendarDay(dayKey, data, day, monthName, year) {
      activeCalFilteredDate = dayKey;
      const banner = document.getElementById('calendar-filter-banner');
      const label = document.getElementById('calendar-filter-date-label');
      if (banner && label) {
        label.textContent = `${monthName} ${String(day).padStart(2, '0')}, ${year} (${data.count} trade${data.count === 1 ? '' : 's'})`;
        banner.style.display = 'flex';
      }
      renderCalendarHeatmap();
      applyAllJournalFilters();
      journalList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function clearCalendarFilter() {
      activeCalFilteredDate = null;
      const banner = document.getElementById('calendar-filter-banner');
      if (banner) banner.style.display = 'none';
      renderCalendarHeatmap();
      applyAllJournalFilters();
    }

    // Month Navigation Listeners
    const prevMonthBtn = document.getElementById('cal-prev-month');
    const nextMonthBtn = document.getElementById('cal-next-month');
    const todayMonthBtn = document.getElementById('cal-today-btn');
    const clearCalFilterBtn = document.getElementById('btn-clear-cal-filter');

    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() - 1);
        renderCalendarHeatmap();
      });
    }
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() + 1);
        renderCalendarHeatmap();
      });
    }
    if (todayMonthBtn) {
      todayMonthBtn.addEventListener('click', () => {
        currentCalDate = new Date();
        renderCalendarHeatmap();
      });
    }
    if (clearCalFilterBtn) {
      clearCalFilterBtn.addEventListener('click', clearCalendarFilter);
    }

    // ==========================================================================
    // POST-TRADE DEBRIEF MODAL ENGINE
    // ==========================================================================
    let selectedGrade = 'A+';
    let selectedGradeTitle = 'Flawless Discipline';
    let selectedEmotion = 'Calm & Patient';
    let selectedExitQuality = 'Target Hit';

    const debriefModal = document.getElementById('trade-debrief-modal');
    const debriefBackdrop = document.getElementById('trade-debrief-backdrop');
    const closeDebriefBtn = document.getElementById('close-debrief-btn');
    const cancelDebriefBtn = document.getElementById('cancel-debrief-btn');
    const saveDebriefBtn = document.getElementById('save-debrief-btn');
    const editDebriefTrigger = document.getElementById('inspector-edit-debrief-btn');

    function openDebriefModal() {
      if (!debriefModal || !currentInspectedCard) return;
      const tradeId = currentInspectedTradeId;
      const asset = currentInspectedCard.getAttribute('data-asset') || 'Trade';
      const dir = (currentInspectedCard.getAttribute('data-direction') || 'long').toUpperCase();
      const pnl = parseFloat(currentInspectedCard.getAttribute('data-pnl')) || 0;
      const pnlFormatted = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;

      const titleEl = document.getElementById('debrief-modal-trade-title');
      if (titleEl) titleEl.textContent = `Audit Execution: ${asset} ${dir} (${pnlFormatted})`;

      // Retrieve existing debrief if any
      let existing = null;
      try {
        const stored = JSON.parse(localStorage.getItem('dma_trade_debriefs') || '{}');
        existing = stored[tradeId];
      } catch (_) {}

      selectedGrade = existing?.grade || (currentInspectedCard.classList.contains('followed') ? 'A+' : 'F');
      selectedGradeTitle = existing?.title || (selectedGrade === 'A+' ? 'Flawless Discipline' : 'Full Rule Breach');
      selectedEmotion = existing?.emotion || 'Calm & Patient';
      selectedExitQuality = existing?.exitQuality || 'Target Hit';

      // Update UI selections
      document.querySelectorAll('#debrief-grades-picker .debrief-grade-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-grade') === selectedGrade);
      });
      document.querySelectorAll('#debrief-emotion-picker .debrief-pill').forEach(pill => {
        pill.classList.toggle('active', pill.getAttribute('data-emotion') === selectedEmotion);
      });
      document.querySelectorAll('#debrief-exit-picker .debrief-pill').forEach(pill => {
        pill.classList.toggle('active', pill.getAttribute('data-exit') === selectedExitQuality);
      });

      const lessonsInput = document.getElementById('debrief-lessons-input');
      if (lessonsInput) lessonsInput.value = existing?.lessons || '';

      debriefModal.classList.add('open');
      debriefModal.setAttribute('aria-hidden', 'false');
      if (debriefBackdrop) debriefBackdrop.classList.add('open');
    }

    function closeDebriefModal() {
      if (debriefModal) {
        debriefModal.classList.remove('open');
        debriefModal.setAttribute('aria-hidden', 'true');
      }
      if (debriefBackdrop) debriefBackdrop.classList.remove('open');
    }

    if (editDebriefTrigger) editDebriefTrigger.addEventListener('click', openDebriefModal);
    if (closeDebriefBtn) closeDebriefBtn.addEventListener('click', closeDebriefModal);
    if (cancelDebriefBtn) cancelDebriefBtn.addEventListener('click', closeDebriefModal);
    if (debriefBackdrop) debriefBackdrop.addEventListener('click', closeDebriefModal);

    // Grade picker clicks
    document.querySelectorAll('#debrief-grades-picker .debrief-grade-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#debrief-grades-picker .debrief-grade-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedGrade = btn.getAttribute('data-grade');
        selectedGradeTitle = btn.getAttribute('data-title') || `Grade: ${selectedGrade}`;
      });
    });

    // Emotion picker clicks
    document.querySelectorAll('#debrief-emotion-picker .debrief-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#debrief-emotion-picker .debrief-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedEmotion = pill.getAttribute('data-emotion');
      });
    });

    // Exit quality picker clicks
    document.querySelectorAll('#debrief-exit-picker .debrief-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('#debrief-exit-picker .debrief-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedExitQuality = pill.getAttribute('data-exit');
      });
    });

    // Save Debrief handler
    if (saveDebriefBtn) {
      saveDebriefBtn.addEventListener('click', () => {
        if (!currentInspectedCard) return;
        const tradeId = currentInspectedTradeId;
        const lessons = document.getElementById('debrief-lessons-input')?.value.trim() || '';

        const debriefObj = {
          grade: selectedGrade,
          title: selectedGradeTitle,
          emotion: selectedEmotion,
          exitQuality: selectedExitQuality,
          lessons,
          timestamp: Date.now()
        };

        // Save to localStorage
        try {
          const stored = JSON.parse(localStorage.getItem('dma_trade_debriefs') || '{}');
          stored[tradeId] = debriefObj;
          localStorage.setItem('dma_trade_debriefs', JSON.stringify(stored));
        } catch (err) {
          console.warn('Storage error for debriefs', err);
        }

        // Update card attribute
        currentInspectedCard.setAttribute('data-debrief', JSON.stringify(debriefObj));

        // Add or update badge on the trade card
        let existingBadge = currentInspectedCard.querySelector('.trade-debrief-badge');
        const gradeLetter = (selectedGrade || 'A').charAt(0).toLowerCase();
        if (!existingBadge) {
          existingBadge = document.createElement('span');
          existingBadge.className = `trade-debrief-badge grade-${gradeLetter}`;
          const footerEl = currentInspectedCard.querySelector('.trade-footer');
          if (footerEl) footerEl.appendChild(existingBadge);
        } else {
          existingBadge.className = `trade-debrief-badge grade-${gradeLetter}`;
        }
        existingBadge.textContent = `Grade: ${selectedGrade}`;

        // Re-open/update inspector view
        openTradeInspector(currentInspectedCard);
        closeDebriefModal();
        renderCalendarHeatmap();
      });
    }

    // Initial pass & Global Hook
    window.refreshJournal = renderAllJournalTrades;
    renderAllJournalTrades();
  }

  // Ensure init runs
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initJournalModule);
  } else {
    initJournalModule();
  }
  window.addEventListener('storage', (e) => {
    if (e.key === 'dma_trades' && typeof window.refreshJournal === 'function') {
      window.refreshJournal(false);
    }
  });


  // Tooltip Logic for Analytics Heatmap
  const tooltipTriggers = document.querySelectorAll('.tooltip-trigger');
  const globalTooltip = document.getElementById('global-tooltip');

  if (globalTooltip && tooltipTriggers.length > 0) {
    tooltipTriggers.forEach(trigger => {
      trigger.addEventListener('mouseenter', (e) => {
        const info = e.target.getAttribute('data-tooltip');
        if (info) {
          globalTooltip.textContent = info;
          globalTooltip.classList.add('show');
          
          // Position it initially
          const rect = e.target.getBoundingClientRect();
          globalTooltip.style.top = `${rect.top + window.scrollY - 30}px`;
          globalTooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;
          globalTooltip.style.transform = `translateX(-50%)`;
        }
      });
      
      trigger.addEventListener('mousemove', (e) => {
        // Optional: follow cursor slightly or keep fixed above
        globalTooltip.style.top = `${e.pageY - 35}px`;
        globalTooltip.style.left = `${e.pageX}px`;
        globalTooltip.style.transform = `translateX(-50%)`;
      });

      trigger.addEventListener('mouseleave', () => {
        globalTooltip.classList.remove('show');
      });
    });
  }

  // ==========================================================================
  // ==========================================================================
  // DYNAMIC ANALYTICS & TRUTH ENGINE
  // ==========================================================================
  let currentPeriod = 'this_month';
  let activeScrubIndex = 2; // Default to Wk 3

  function getDynamicAnalytics(period) {
    // 1. Base benchmarks for each period
    const basePeriods = {
      this_month: {
        baseTotal: 44,
        baseCompliant: 34,
        baseActual: 4250,
        baseFollowed: 6100,
        xLabels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
        weeks: [
          { label: 'Wk 1', actual: 800, ideal: 950, scrubX: 50 },
          { label: 'Wk 2', actual: 1650, ideal: 2400, scrubX: 100 },
          { label: 'Wk 3', actual: 2400, ideal: 4200, scrubX: 200 },
          { label: 'Wk 4', actual: 4250, ideal: 6100, scrubX: 295 }
        ],
        m1: { name: 'Moved Stop Loss', count: 12, cost: -1100 },
        m2: { name: 'Impulse / FOMO Entry', count: 4, cost: -450 },
        m3: { name: 'Exited Early (Fear)', count: 3, cost: -300 },
        edges: [
          { name: 'London Session', val: 72 },
          { name: 'A+ Reversal Setup', val: 68 },
          { name: 'Trend Continuation', val: 54 },
          { name: 'Asian Session', val: 28 }
        ]
      },
      last_month: {
        baseTotal: 39,
        baseCompliant: 25,
        baseActual: 1820,
        baseFollowed: 5200,
        xLabels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
        weeks: [
          { label: 'Wk 1', actual: 450, ideal: 1100, scrubX: 50 },
          { label: 'Wk 2', actual: 900, ideal: 2300, scrubX: 100 },
          { label: 'Wk 3', actual: 1200, ideal: 3800, scrubX: 200 },
          { label: 'Wk 4', actual: 1820, ideal: 5200, scrubX: 295 }
        ],
        m1: { name: 'Moved Stop Loss', count: 19, cost: -2100 },
        m2: { name: 'Impulse / FOMO Entry', count: 8, cost: -880 },
        m3: { name: 'Exited Early (Fear)', count: 4, cost: -400 },
        edges: [
          { name: 'London Session', val: 64 },
          { name: 'A+ Reversal Setup', val: 58 },
          { name: 'Trend Continuation', val: 45 },
          { name: 'Asian Session', val: 19 }
        ]
      },
      all_time: {
        baseTotal: 166,
        baseCompliant: 118,
        baseActual: 14600,
        baseFollowed: 24150,
        xLabels: ['Q1', 'Q2', 'Q3', 'Q4'],
        weeks: [
          { label: 'Q1', actual: 3200, ideal: 5400, scrubX: 50 },
          { label: 'Q2', actual: 6800, ideal: 11200, scrubX: 100 },
          { label: 'Q3', actual: 10900, ideal: 17900, scrubX: 200 },
          { label: 'Q4', actual: 14600, ideal: 24150, scrubX: 295 }
        ],
        m1: { name: 'Moved Stop Loss', count: 58, cost: -5800 },
        m2: { name: 'Impulse / FOMO Entry', count: 22, cost: -2450 },
        m3: { name: 'Exited Early (Fear)', count: 13, cost: -1300 },
        edges: [
          { name: 'London Session', val: 69 },
          { name: 'A+ Reversal Setup', val: 64 },
          { name: 'Trend Continuation', val: 51 },
          { name: 'Asian Session', val: 24 }
        ]
      }
    };

    const rawB = basePeriods[period] || basePeriods.this_month;
    const b = JSON.parse(JSON.stringify(rawB));

    b.baseTotal = 0;
    b.baseCompliant = 0;
    b.baseActual = 0;
    b.baseFollowed = 0;
    b.m1.count = 0; b.m1.cost = 0;
    b.m2.count = 0; b.m2.cost = 0;
    b.m3.count = 0; b.m3.cost = 0;
    b.weeks.forEach(w => { w.actual = 0; w.ideal = 0; });

    // Load custom logged trades
    let customTrades = [];
    try {
      customTrades = JSON.parse(localStorage.getItem('dma_trades') || '[]');
    } catch (_) {}

    let addedTotal = 0;
    let addedCompliant = 0;
    let addedActualPnl = 0;
    let addedFollowedPnl = 0;

    customTrades.forEach(t => {
      addedTotal += 1;
      const pnl = Number(t.pnl) || 0;
      addedActualPnl += pnl;

      if (t.isCompliant) {
        addedCompliant += 1;
        addedFollowedPnl += pnl;
      } else {
        if (pnl >= 0) {
          addedFollowedPnl += pnl;
        }
        const breach = (t.breachReason || 'Impulse / FOMO Entry').toLowerCase();
        if (breach.includes('stop')) {
          b.m1.count += 1;
          b.m1.cost += pnl < 0 ? pnl : -100;
        } else if (breach.includes('fomo') || breach.includes('impulse') || breach.includes('chase')) {
          b.m2.count += 1;
          b.m2.cost += pnl < 0 ? pnl : -150;
        } else {
          b.m3.count += 1;
          b.m3.cost += pnl < 0 ? pnl : -100;
        }
      }
    });

    const totalTrades = b.baseTotal + addedTotal;
    const compliantTrades = b.baseCompliant + addedCompliant;
    const brokenTrades = totalTrades - compliantTrades;
    const score = totalTrades > 0 ? Math.round((compliantTrades / totalTrades) * 100) : '--';

    let grade = 'GRADE: B-';
    let status = 'LEAK DETECTED';
    let statusClass = 'warning';

    if (totalTrades === 0) {
      grade = 'GRADE: N/A';
      status = 'NO TRADES RECORDED';
      statusClass = 'neutral';
    } else if (score >= 88) {
      grade = 'GRADE: A+';
      status = 'FLAWLESS DISCIPLINE';
      statusClass = 'success';
    } else if (score >= 80) {
      grade = 'GRADE: A';
      status = 'DISCIPLINED TRADER';
      statusClass = 'success';
    } else if (score >= 70) {
      grade = 'GRADE: B';
      status = 'STEADY DISCIPLINE';
      statusClass = 'warning';
    } else if (score >= 55) {
      grade = 'GRADE: C';
      status = 'LEAK DETECTED';
      statusClass = 'warning';
    } else {
      grade = 'GRADE: F';
      status = 'HIGH DISCIPLINE RISK';
      statusClass = 'danger';
    }

    const netActual = b.baseActual + addedActualPnl;
    const netFollowed = b.baseFollowed + addedFollowedPnl;
    const netFomoTax = Math.max(0, netFollowed - netActual);

    const fmt = (num) => formatMoney(Math.round(num), { decimals: 0 });

    const finalWk = b.weeks[b.weeks.length - 1];
    finalWk.actual = netActual;
    finalWk.ideal = netFollowed;

    const weeksFormatted = b.weeks.map(w => {
      const g = w.actual - w.ideal;
      return {
        label: w.label,
        actual: fmt(w.actual),
        ideal: fmt(w.ideal),
        gap: g >= 0 ? fmt(g) : formatMoney(-Math.round(Math.abs(g)), { decimals: 0 }),
        scrubX: w.scrubX
      };
    });

    const maxVal = Math.max(netFollowed, 8000, ...b.weeks.map(w => Math.max(w.actual, w.ideal)));
    const minVal = 0;
    const range = maxVal - minVal || 1;

    const calcY = (val) => {
      const norm = (val - minVal) / range;
      return Math.round(95 - (norm * 90));
    };

    const actualPoints = [
      `0,95`,
      `50,${calcY(b.weeks[0].actual)}`,
      `100,${calcY(b.weeks[1].actual)}`,
      `200,${calcY(b.weeks[2].actual)}`,
      `300,${calcY(netActual)}`
    ].join(' ');

    const idealPoints = [
      `0,95`,
      `50,${calcY(b.weeks[0].ideal)}`,
      `100,${calcY(b.weeks[1].ideal)}`,
      `200,${calcY(b.weeks[2].ideal)}`,
      `300,${calcY(netFollowed)}`
    ].join(' ');

    return {
      score: totalTrades > 0 ? score : '--',
      grade,
      status,
      statusClass,
      bar: totalTrades > 0 ? `${score}%` : '0%',
      meta: totalTrades > 0 
        ? `<strong>${compliantTrades} of ${totalTrades}</strong> trades followed 100% of confluences.`
        : '<strong>0 of 0</strong> trades logged. Complete a trade to unlock audit.',
      leak: totalTrades > 0 ? `${brokenTrades} trades with broken rules` : '0 rule violations',
      actual: totalTrades > 0 ? fmt(netActual) : formatMoney(0, { noSign: true, decimals: 0 }),
      followed: totalTrades > 0 ? fmt(netFollowed) : formatMoney(0, { noSign: true, decimals: 0 }),
      fomoTax: totalTrades > 0 ? formatMoney(Math.round(netFomoTax), { noSign: true, decimals: 0 }) : formatMoney(0, { noSign: true, decimals: 0 }),
      weeks: weeksFormatted,
      xLabels: b.xLabels,
      polyActual: actualPoints,
      polyIdeal: idealPoints,
      m1: {
        count: `${b.m1.count} Occurrences`,
        leak: b.m1.count > 0 ? `${formatMoney(-Math.round(Math.abs(b.m1.cost) / (b.m1.count || 1)), { decimals: 0 })} / breach` : `${formatMoney(0, { noSign: true, decimals: 0 })} / breach`,
        cost: b.m1.count > 0 ? fmt(b.m1.cost) : formatMoney(0, { noSign: true, decimals: 0 })
      },
      m2: {
        count: `${b.m2.count} Occurrences`,
        leak: b.m2.count > 0 ? `${formatMoney(-Math.round(Math.abs(b.m2.cost) / (b.m2.count || 1)), { decimals: 0 })} / breach` : `${formatMoney(0, { noSign: true, decimals: 0 })} / breach`,
        cost: b.m2.count > 0 ? fmt(b.m2.cost) : formatMoney(0, { noSign: true, decimals: 0 })
      },
      m3: {
        count: `${b.m3.count} Occurrences`,
        leak: b.m3.count > 0 ? `${formatMoney(-Math.round(Math.abs(b.m3.cost) / (b.m3.count || 1)), { decimals: 0 })} / breach` : `${formatMoney(0, { noSign: true, decimals: 0 })} / breach`,
        cost: b.m3.count > 0 ? fmt(b.m3.cost) : formatMoney(0, { noSign: true, decimals: 0 })
      },
      edges: (() => {
        let followedWins = 0;
        let followedCount = 0;
        let brokenWins = 0;
        let brokenCount = 0;
        const stratMap = {};
        const assetMap = {};

        customTrades.forEach(t => {
          const isWin = (Number(t.pnl) > 0) || t.outcome === 'win';
          if (t.isCompliant) {
            followedCount++;
            if (isWin) followedWins++;
          } else {
            brokenCount++;
            if (isWin) brokenWins++;
          }

          const sName = t.strategy || t.strategyKey || 'Playbook Setup';
          if (!stratMap[sName]) stratMap[sName] = { total: 0, wins: 0 };
          stratMap[sName].total++;
          if (isWin) stratMap[sName].wins++;

          const aName = (t.asset || 'XAUUSD').toUpperCase();
          if (!assetMap[aName]) assetMap[aName] = { total: 0, wins: 0 };
          assetMap[aName].total++;
          if (isWin) assetMap[aName].wins++;
        });

        const fWr = followedCount > 0 ? Math.round((followedWins / followedCount) * 100) : 0;
        const bWr = brokenCount > 0 ? Math.round((brokenWins / brokenCount) * 100) : 0;

        let bestStrat = { name: 'Top Setup Strategy', wr: 0, count: 0 };
        Object.keys(stratMap).forEach(k => {
          const item = stratMap[k];
          const wr = Math.round((item.wins / item.total) * 100);
          if (wr >= bestStrat.wr) {
            bestStrat = { name: k, wr, count: item.total };
          }
        });

        let bestAsset = { name: 'Primary Asset', wr: 0, count: 0 };
        Object.keys(assetMap).forEach(k => {
          const item = assetMap[k];
          const wr = Math.round((item.wins / item.total) * 100);
          if (wr >= bestAsset.wr) {
            bestAsset = { name: k, wr, count: item.total };
          }
        });

        return [
          {
            name: followedCount > 0 ? `Rules Followed (${followedCount} Trades)` : 'Rules Followed Setup',
            val: followedCount > 0 ? `${fWr}%` : '--%',
            bar: followedCount > 0 ? `${fWr}%` : '0%'
          },
          {
            name: bestStrat.count > 0 ? `${bestStrat.name} (${bestStrat.count} Trades)` : 'Top Setup Strategy',
            val: bestStrat.count > 0 ? `${bestStrat.wr}%` : '--%',
            bar: bestStrat.count > 0 ? `${bestStrat.wr}%` : '0%'
          },
          {
            name: bestAsset.count > 0 ? `${bestAsset.name} (${bestAsset.count} Trades)` : 'Primary Asset',
            val: bestAsset.count > 0 ? `${bestAsset.wr}%` : '--%',
            bar: bestAsset.count > 0 ? `${bestAsset.wr}%` : '0%'
          },
          {
            name: brokenCount > 0 ? `Rules Broken (${brokenCount} Breaches)` : 'Rules Broken (FOMO Penalty)',
            val: brokenCount > 0 ? `${bWr}%` : '--%',
            bar: brokenCount > 0 ? `${bWr}%` : '0%'
          }
        ];
      })()
    };
  }

  function renderAnalytics(period) {
    const data = getDynamicAnalytics(period);
    if (!data) return;

    // 1. Discipline score
    const scoreNum = document.getElementById('discipline-score-num');
    const grade = document.getElementById('discipline-grade');
    const statusPill = document.getElementById('discipline-status-pill');
    const bar = document.getElementById('discipline-bar');
    const meta = document.getElementById('discipline-meta-text');

    if (scoreNum) scoreNum.textContent = data.score;
    if (grade) grade.textContent = data.grade;
    if (statusPill) {
      statusPill.textContent = data.status;
      statusPill.className = `status-pill ${data.statusClass}`;
    }
    if (bar) bar.style.width = data.bar;
    if (meta) {
      meta.innerHTML = `<span>${data.meta}</span><span class="leak-count">${data.leak}</span>`;
    }

    // 2. Truth Engine PnL
    const actualPnl = document.getElementById('stat-actual-pnl');
    const followedPnl = document.getElementById('stat-followed-pnl');
    const fomoTax = document.getElementById('fomo-tax-amount');
    const svgActual = document.getElementById('svg-actual-line');
    const svgIdeal = document.getElementById('svg-ideal-line');

    if (actualPnl) actualPnl.textContent = data.actual;
    if (followedPnl) followedPnl.textContent = data.followed;
    if (fomoTax) fomoTax.textContent = data.fomoTax;
    if (svgActual) svgActual.setAttribute('points', data.polyActual);
    if (svgIdeal) svgIdeal.setAttribute('points', data.polyIdeal);

    // Update X-axis labels
    const labelItems = document.querySelectorAll('#chart-x-labels .label-item');
    labelItems.forEach((lbl, i) => {
      if (data.xLabels[i]) lbl.textContent = data.xLabels[i];
    });

    // 3. Update Scrub Callout
    updateScrubPoint(activeScrubIndex);

    // 4. Mistake unit economics
    const m1Count = document.getElementById('m1-count');
    const m1Leak = document.getElementById('m1-leak');
    const m1Cost = document.getElementById('m1-cost');
    if (m1Count) m1Count.textContent = data.m1.count;
    if (m1Leak) m1Leak.textContent = data.m1.leak;
    if (m1Cost) m1Cost.textContent = data.m1.cost;

    const m2Count = document.getElementById('m2-count');
    const m2Leak = document.getElementById('m2-leak');
    const m2Cost = document.getElementById('m2-cost');
    if (m2Count) m2Count.textContent = data.m2.count;
    if (m2Leak) m2Leak.textContent = data.m2.leak;
    if (m2Cost) m2Cost.textContent = data.m2.cost;

    const m3Count = document.getElementById('m3-count');
    const m3Leak = document.getElementById('m3-leak');
    const m3Cost = document.getElementById('m3-cost');
    if (m3Count) m3Count.textContent = data.m3.count;
    if (m3Leak) m3Leak.textContent = data.m3.leak;
    if (m3Cost) m3Cost.textContent = data.m3.cost;

    // Render breach trades in mistake drawers if present
    try {
      const customTrades = JSON.parse(localStorage.getItem('dma_trades') || '[]');
      ['m1', 'm2', 'm3'].forEach((mKey, idx) => {
        const drawer = document.getElementById(`${mKey}-drawer`);
        if (drawer) {
          const inner = drawer.querySelector('.drawer-inner');
          if (inner) {
            const actionBtn = inner.querySelector('.drawer-action-btn');
            const matchingBreaches = customTrades.filter(t => {
              if (t.isCompliant) return false;
              const breach = (t.breachReason || '').toLowerCase();
              if (idx === 0) return breach.includes('stop');
              if (idx === 1) return breach.includes('fomo') || breach.includes('impulse') || breach.includes('chase');
              return !breach.includes('stop') && !breach.includes('fomo') && !breach.includes('impulse') && !breach.includes('chase');
            });

            const existingRows = inner.querySelectorAll('.sample-trade-row, .empty-drawer-note');
            existingRows.forEach(r => r.remove());

            if (matchingBreaches.length === 0) {
              const note = document.createElement('div');
              note.className = 'empty-drawer-note';
              note.style.cssText = 'color: var(--ink-muted); font-size: 0.78rem; padding: 0.5rem 0;';
              note.textContent = 'No breach trades recorded';
              if (actionBtn) inner.insertBefore(note, actionBtn);
              else inner.appendChild(note);
            } else {
              matchingBreaches.slice(0, 5).forEach(bTrade => {
                const row = document.createElement('div');
                row.className = 'sample-trade-row';
                const pnlVal = Number(bTrade.pnl) || 0;
                row.innerHTML = `
                  <span class="st-date">${bTrade.date || 'Recent'}</span>
                  <span class="st-asset">${bTrade.asset || 'Trade'} ${bTrade.direction || ''}</span>
                  <span class="st-loss">-$${Math.abs(pnlVal).toLocaleString('en-US')}</span>
                `;
                if (actionBtn) inner.insertBefore(row, actionBtn);
                else inner.appendChild(row);
              });
            }
          }
        }
      });
    } catch (_) {}

    // 5. Edges
    data.edges.forEach((edge, idx) => {
      const nameEl = document.getElementById(`edge-name-${idx+1}`);
      const barEl = document.getElementById(`edge-bar-${idx+1}`);
      const valEl = document.getElementById(`edge-val-${idx+1}`);
      if (nameEl) nameEl.textContent = edge.name;
      if (barEl) barEl.style.width = edge.bar;
      if (valEl) valEl.textContent = edge.val;
    });
  }

  function updateScrubPoint(idx) {
    const data = getDynamicAnalytics(currentPeriod);
    if (!data || !data.weeks[idx]) return;
    const pt = data.weeks[idx];

    activeScrubIndex = idx;

    const calloutPoint = document.getElementById('callout-point');
    const calloutActual = document.getElementById('callout-actual');
    const calloutIdeal = document.getElementById('callout-ideal');
    const calloutGap = document.getElementById('callout-gap');
    const scrubLine = document.getElementById('svg-scrub-line');

    if (calloutPoint) calloutPoint.textContent = pt.label;
    if (calloutActual) calloutActual.textContent = pt.actual;
    if (calloutIdeal) calloutIdeal.textContent = pt.ideal;
    if (calloutGap) calloutGap.textContent = pt.gap;
    if (scrubLine) {
      scrubLine.setAttribute('x1', pt.scrubX);
      scrubLine.setAttribute('x2', pt.scrubX);
    }

    // Update active label highlight
    const labelItems = document.querySelectorAll('#chart-x-labels .label-item');
    labelItems.forEach((lbl, i) => {
      if (i === idx) lbl.classList.add('active');
      else lbl.classList.remove('active');
    });

    const tapZones = document.querySelectorAll('.tap-zone');
    tapZones.forEach((tz, i) => {
      if (i === idx) tz.classList.add('active');
      else tz.classList.remove('active');
    });
  }

  // Timeframe Tabs Click Listener
  const timeframeTabs = document.querySelectorAll('#analytics-timeframe-tabs .tab-btn');
  timeframeTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      timeframeTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const period = btn.getAttribute('data-period');
      if (period) {
        currentPeriod = period;
        renderAnalytics(period);
      }
    });
  });

  // Chart Tap Zones & Labels Scrubbing
  const tapZones = document.querySelectorAll('.tap-zone');
  tapZones.forEach(zone => {
    zone.addEventListener('click', () => {
      const idx = parseInt(zone.getAttribute('data-point-idx'), 10);
      if (!isNaN(idx)) updateScrubPoint(idx);
    });
  });

  const chartLabels = document.querySelectorAll('#chart-x-labels .label-item');
  chartLabels.forEach(lbl => {
    lbl.addEventListener('click', () => {
      const idx = parseInt(lbl.getAttribute('data-idx'), 10);
      if (!isNaN(idx)) updateScrubPoint(idx);
    });
  });

  // Mistake Accordions (Tap to inspect)
  const mistakeAccordions = document.querySelectorAll('.mistake-item-accordion');
  mistakeAccordions.forEach(item => {
    const trigger = item.querySelector('.mistake-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close other open ones
        mistakeAccordions.forEach(other => other.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  // Export Trading Report CSV Engine
  const exportAnalyticsBtn = document.getElementById('export-analytics-report-btn');
  if (exportAnalyticsBtn) {
    exportAnalyticsBtn.addEventListener('click', () => {
      let customTrades = [];
      try {
        customTrades = JSON.parse(localStorage.getItem('dma_trades') || '[]');
      } catch (_) {}

      let debriefs = {};
      try {
        debriefs = JSON.parse(localStorage.getItem('dma_trade_debriefs') || '{}');
      } catch (_) {}

      const all = customTrades;
      if (all.length === 0) {
        showAppToast({
          title: 'Export Unavailable',
          message: 'No live trades logged yet. Log a trade in the Trade Terminal to export your journal report.',
          type: 'info'
        });
        return;
      }

      const headers = ['Trade ID', 'Date/Time', 'Asset', 'Direction', 'Setup Strategy', 'PnL ($)', 'R-Multiple', 'Adherence Status', 'Confluences Met', 'Breach Reason', 'Execution Grade', 'Psychology / Emotion', 'Exit Quality', 'Retrospective Lessons'];
      const rows = [headers.join(',')];

      all.forEach(t => {
        const tid = t.id || 'N/A';
        const deb = debriefs[tid] || {};
        const fDate = `"${t.date || 'Recent'}"`;
        const fAsset = `"${t.asset || 'XAUUSD'}"`;
        const fDir = `"${(t.direction || 'LONG').toUpperCase()}"`;
        const fSetup = `"${(t.strategy || t.setup || 'Playbook Setup').replace(/"/g, '""')}"`;
        const fPnl = `"${Number(t.pnl) || 0}"`;
        const fR = `"${t.rMultiple || '+1.0R'}"`;
        const fComp = t.isCompliant ? '"100% GATES FOLLOWED"' : '"RULE VIOLATION"';
        const fMet = `"${t.confluencesMet || (t.isCompliant ? 4 : 1)}/${t.totalConfluences || 4}"`;
        const fBreach = `"${(t.breachReason || '').replace(/"/g, '""')}"`;
        const fGrade = `"${deb.grade || (t.isCompliant ? 'A+' : 'F')}"`;
        const fEmotion = `"${deb.emotion || (t.isCompliant ? 'Calm & Patient' : 'FOMO / Chasing')}"`;
        const fExit = `"${deb.exitQuality || (Number(t.pnl) >= 0 ? 'Target Hit' : 'SL Respected')}"`;
        const fLessons = `"${(deb.lessons || t.notes || '').replace(/"/g, '""')}"`;

        rows.push([`"${tid}"`, fDate, fAsset, fDir, fSetup, fPnl, fR, fComp, fMet, fBreach, fGrade, fEmotion, fExit, fLessons].join(','));
      });

      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const todayStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `DMA_Discipline_Analytics_Report_${todayStr}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Initial call on analytics page if present
  if (document.getElementById('discipline-score-num')) {
    renderAnalytics(currentPeriod);
  }

// ==========================================================================
// TRADE LOGGING ENGINE (Confluence Verification & Live Ledger Entry)
// ==========================================================================
const tradeStrategies = {
  reversal: {
    name: 'A+ Setup Reversal',
    confluences: [
      '4H Key S/R Level or Liquidity Pool swept',
      '15M Market Structure Shift (MSS) with displacement candle',
      'Order Block or Fair Value Gap (FVG) retest established',
      'Strict 1:2.5 minimum Risk-to-Reward profile'
    ]
  },
  trend: {
    name: 'Trend Continuation',
    confluences: [
      'Daily & 4H Trend Alignment confirmed (Higher Highs / Lower Lows)',
      'Break of Structure (BOS) with clear volume expansion',
      'Entry strictly inside Discount zone (<50% Fib retracement)'
    ]
  },
  impulse: {
    name: 'Liquidity Sweep',
    confluences: [
      'Previous Day High/Low (PDH/PDL) swept during active London/NY session',
      'Immediate rejection wick closing back within the prior range',
      'Strict invalidation level anchored beyond candle wick'
    ]
  },
  breakout: {
    name: 'London Open Breakout',
    confluences: [
      'Asian session range strictly under 35 pips',
      'Pre-London Judas Swing / Fakeout swept',
      '08:00–08:30 GMT displacement candle outside range',
      'Stop loss tucked behind Judas swing low/high'
    ]
  }
};

let activeStrategyKey = 'reversal';
let activeDirection = 'long';
let activeOutcome = 'win';
let isConfluencesVerified = false;

// Post-Trade Debrief state in Log Trade Modal
let activeLogGrade = 'A+';
let activeLogGradeTitle = 'Flawless Discipline';
let activeLogEmotion = 'Calm & Patient';
let activeLogExit = 'Target Hit';
let isLogGradeManuallySet = false;

function updateModalStrategyHeader(strategyKey) {
  const strat = tradeStrategies[strategyKey] || tradeStrategies.reversal;
  const pb = typeof playbookRegistry !== 'undefined' ? playbookRegistry[strategyKey] : null;

  const subHeading = document.getElementById('log-modal-subheading');
  if (subHeading && strat) {
    subHeading.textContent = `${strat.name} · Mandatory Criteria`;
  }

  const rrBadge = document.getElementById('strategy-rr-badge');
  if (rrBadge) {
    rrBadge.textContent = pb?.targetRR || '1:2.5 Min R:R';
  }
}

function openLogTradeModal() {
  const modal = document.getElementById('log-trade-modal');
  const backdrop = document.getElementById('log-trade-backdrop');
  if (!modal || !backdrop) return;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';

  const logStrategySelect = document.getElementById('log-strategy-select');
  if (logStrategySelect && activeStrategyKey) {
    logStrategySelect.value = activeStrategyKey;
  }

  updateModalStrategyHeader(activeStrategyKey);
  renderConfluenceChecklist(activeStrategyKey);

  // Reset Debrief & Retrospective inputs for calm post-trade reflection
  isLogGradeManuallySet = false;
  activeLogGrade = 'A+';
  activeLogGradeTitle = 'Flawless Discipline';
  activeLogEmotion = 'Calm & Patient';
  activeLogExit = 'Target Hit';

  document.querySelectorAll('#log-debrief-grades-picker .debrief-grade-btn').forEach((b, idx) => {
    b.classList.toggle('active', idx === 0);
  });
  document.querySelectorAll('#log-debrief-emotion-picker .debrief-pill').forEach((p, idx) => {
    p.classList.toggle('active', idx === 0);
  });
  document.querySelectorAll('#log-debrief-exit-picker .debrief-pill').forEach((p, idx) => {
    p.classList.toggle('active', idx === 0);
  });
  const lessonsInput = document.getElementById('log-debrief-lessons-input');
  if (lessonsInput) lessonsInput.value = '';

  if (typeof populateAccountSelects === 'function') {
    populateAccountSelects();
  }
  const quickEditor = document.getElementById('account-quick-editor');
  if (quickEditor) quickEditor.style.display = 'none';

  if (typeof setPnlSign === 'function') {
    setPnlSign(activePnlSign || '+');
  }

  if (typeof updateAccountImpactReadout === 'function') {
    updateAccountImpactReadout();
  }
}

function closeLogTradeModal() {
  const modal = document.getElementById('log-trade-modal');
  const backdrop = document.getElementById('log-trade-backdrop');
  if (!modal || !backdrop) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('open');
  document.body.style.overflow = '';

  try {
    localStorage.removeItem('dma_active_trade_draft');
  } catch (_) {}
}

function renderConfluenceChecklist(strategyKey) {
  const container = document.getElementById('confluence-checklist-items') || document.getElementById('checklist-confluences-container');
  if (!container) return;

  const strat = tradeStrategies[strategyKey] || tradeStrategies.reversal;
  container.innerHTML = '';
  isConfluencesVerified = false;

  strat.confluences.forEach((confText, index) => {
    const row = document.createElement('div');
    row.className = 'confluence-item-row';
    row.setAttribute('data-idx', index);

    row.innerHTML = `
      <div class="confluence-checkbox">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <span class="confluence-label">${confText}</span>
    `;

    row.addEventListener('click', () => {
      row.classList.toggle('checked');
      onConfluenceRowToggled();
    });

    container.appendChild(row);
  });

  resetComplianceToPending();
}

function resetComplianceToPending() {
  isConfluencesVerified = false;
  const rows = document.querySelectorAll('.confluence-item-row');
  const total = rows.length;
  let met = 0;
  rows.forEach(r => { if (r.classList.contains('checked')) met++; });

  const percent = total > 0 ? Math.round((met / total) * 100) : 0;

  // 1. Progress track & text
  const progressText = document.getElementById('confluence-progress-text') || document.getElementById('checklist-progress-text');
  const trackFill = document.getElementById('confluence-track-fill');
  if (progressText) progressText.textContent = `${met} of ${total} Selected (${percent}%)`;
  if (trackFill) {
    trackFill.style.width = `${percent}%`;
    trackFill.style.background = '#eab308';
  }

  // 2. Top compliance badge - Pending Neutral
  const complianceBadge = document.getElementById('modal-compliance-badge');
  if (complianceBadge) {
    complianceBadge.textContent = met > 0 ? `${met}/${total} SELECTED · UNVERIFIED` : 'UNVERIFIED';
    complianceBadge.className = 'live-compliance-badge pending';
  }

  // 3. Confirmation button reset
  const verifyBtn = document.getElementById('btn-verify-confluences');
  if (verifyBtn) {
    verifyBtn.className = 'btn-verify-confluences';
    const btnText = document.getElementById('verify-btn-text');
    if (btnText) btnText.textContent = 'VERIFY CONFLUENCES';
  }

  // 4. Compliance Callout - Neutral Audit Prompt
  const callout = document.getElementById('compliance-callout');
  const title = document.getElementById('compliance-title');
  const desc = document.getElementById('compliance-desc');
  const breachGroup = document.getElementById('breach-reason-group');
  const pendingIcon = callout ? callout.querySelector('.pending-icon') : null;
  const warnIcon = callout ? callout.querySelector('.warning-icon') : null;
  const verifiedIcon = callout ? callout.querySelector('.verified-icon') : null;

  if (callout) {
    callout.className = 'compliance-callout pending';
    if (title) title.textContent = 'EXECUTION AUDIT PENDING';
    if (desc) desc.textContent = 'Select all satisfied confluence gates above and tap "Verify Confluences" to audit execution adherence.';
    if (pendingIcon) pendingIcon.style.display = 'block';
    if (warnIcon) warnIcon.style.display = 'none';
    if (verifiedIcon) verifiedIcon.style.display = 'none';
    if (breachGroup) breachGroup.style.display = 'none';
  }
}

function onConfluenceRowToggled() {
  const rows = document.querySelectorAll('.confluence-item-row');
  const total = rows.length;
  let met = 0;
  rows.forEach(r => { if (r.classList.contains('checked')) met++; });

  const percent = total > 0 ? Math.round((met / total) * 100) : 0;

  const progressText = document.getElementById('confluence-progress-text') || document.getElementById('checklist-progress-text');
  const trackFill = document.getElementById('confluence-track-fill');
  if (progressText) progressText.textContent = `${met} of ${total} Selected (${percent}%)`;
  if (trackFill) {
    trackFill.style.width = `${percent}%`;
    trackFill.style.background = '#eab308';
  }

  // When user toggles boxes, reset verification state to pending so they must click verify
  isConfluencesVerified = false;
  const complianceBadge = document.getElementById('modal-compliance-badge');
  if (complianceBadge) {
    complianceBadge.textContent = `${met}/${total} SELECTED · UNVERIFIED`;
    complianceBadge.className = 'live-compliance-badge pending';
  }

  const verifyBtn = document.getElementById('btn-verify-confluences');
  if (verifyBtn) {
    verifyBtn.className = 'btn-verify-confluences';
    const btnText = document.getElementById('verify-btn-text');
    if (btnText) btnText.textContent = 'VERIFY CONFLUENCES';
  }

  const callout = document.getElementById('compliance-callout');
  const title = document.getElementById('compliance-title');
  const desc = document.getElementById('compliance-desc');
  const breachGroup = document.getElementById('breach-reason-group');
  const pendingIcon = callout ? callout.querySelector('.pending-icon') : null;
  const warnIcon = callout ? callout.querySelector('.warning-icon') : null;
  const verifiedIcon = callout ? callout.querySelector('.verified-icon') : null;

  if (callout) {
    callout.className = 'compliance-callout pending';
    if (title) title.textContent = 'EXECUTION AUDIT PENDING';
    if (desc) desc.textContent = `${met} of ${total} rules selected. Click "Verify Confluences" to audit execution adherence.`;
    if (pendingIcon) pendingIcon.style.display = 'block';
    if (warnIcon) warnIcon.style.display = 'none';
    if (verifiedIcon) verifiedIcon.style.display = 'none';
    if (breachGroup) breachGroup.style.display = 'none';
  }
}

function performConfluenceVerification() {
  const rows = document.querySelectorAll('.confluence-item-row');
  const total = rows.length;
  let met = 0;
  rows.forEach(r => { if (r.classList.contains('checked')) met++; });

  const percent = total > 0 ? Math.round((met / total) * 100) : 0;
  const isFullCompliance = (met === total && total > 0);
  isConfluencesVerified = true;

  // 1. Progress track & text
  const progressText = document.getElementById('confluence-progress-text') || document.getElementById('checklist-progress-text');
  const trackFill = document.getElementById('confluence-track-fill');
  if (progressText) {
    progressText.textContent = isFullCompliance ? `${met} of ${total} Verified (100%)` : `${met} of ${total} Met (${total - met} Missed)`;
  }
  if (trackFill) {
    trackFill.style.width = `${percent}%`;
    trackFill.style.background = isFullCompliance ? 'var(--success)' : 'var(--danger)';
  }

  // 2. Top compliance badge
  const complianceBadge = document.getElementById('modal-compliance-badge');
  if (complianceBadge) {
    if (isFullCompliance) {
      complianceBadge.textContent = `✓ ${met}/${total} VERIFIED (ADHERENT)`;
      complianceBadge.className = 'live-compliance-badge verified';
    } else {
      complianceBadge.textContent = `⚠ ${met}/${total} VIOLATION (${total - met} MISSED)`;
      complianceBadge.className = 'live-compliance-badge violation';
    }
  }

  // 3. Verify Button State
  const verifyBtn = document.getElementById('btn-verify-confluences');
  const btnText = document.getElementById('verify-btn-text');
  if (verifyBtn) {
    if (isFullCompliance) {
      verifyBtn.className = 'btn-verify-confluences verified';
      if (btnText) btnText.textContent = '✓ 100% CONFLUENCES VERIFIED';
    } else {
      verifyBtn.className = 'btn-verify-confluences violation';
      if (btnText) btnText.textContent = '⚠ RE-VERIFY CONFLUENCES';
    }
  }

  // 4. Compliance callout banner & Breach selector
  const callout = document.getElementById('compliance-callout');
  const title = document.getElementById('compliance-title');
  const desc = document.getElementById('compliance-desc');
  const breachGroup = document.getElementById('breach-reason-group');
  const pendingIcon = callout ? callout.querySelector('.pending-icon') : null;
  const warnIcon = callout ? callout.querySelector('.warning-icon') : null;
  const verifiedIcon = callout ? callout.querySelector('.verified-icon') : null;

  if (callout) {
    if (isFullCompliance) {
      callout.className = 'compliance-callout verified';
      if (title) title.textContent = '100% PLAYBOOK ADHERENCE VERIFIED';
      if (desc) desc.textContent = `All ${total} mandatory confluence criteria satisfied. Execution strictly follows your playbook rules.`;
      if (pendingIcon) pendingIcon.style.display = 'none';
      if (warnIcon) warnIcon.style.display = 'none';
      if (verifiedIcon) verifiedIcon.style.display = 'block';
      if (breachGroup) breachGroup.style.display = 'none';
    } else {
      callout.className = 'compliance-callout violation';
      if (title) title.textContent = `RULE VIOLATION DETECTED (${total - met} MISSED)`;
      if (desc) desc.textContent = `Missing ${total - met} of ${total} confluences. If executed, this trade will be logged under Rules Broken & added to your FOMO Tax.`;
      if (pendingIcon) pendingIcon.style.display = 'none';
      if (warnIcon) warnIcon.style.display = 'block';
      if (verifiedIcon) verifiedIcon.style.display = 'none';
      if (breachGroup) breachGroup.style.display = 'flex';
    }
  }

  // Auto-sync debrief execution grade based on plan compliance unless user manually chose a grade
  if (!isLogGradeManuallySet) {
    activeLogGrade = isFullCompliance ? 'A+' : 'F';
    activeLogGradeTitle = isFullCompliance ? 'Flawless Discipline' : 'Rule Breach';
    document.querySelectorAll('#log-debrief-grades-picker .debrief-grade-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-grade') === activeLogGrade);
    });
  }

  return isFullCompliance;
}

// Modal event listeners setup
const closeLogTradeBtn = document.getElementById('close-log-trade-btn');
const logTradeBackdrop = document.getElementById('log-trade-backdrop');
if (closeLogTradeBtn) closeLogTradeBtn.addEventListener('click', closeLogTradeModal);
if (logTradeBackdrop) logTradeBackdrop.addEventListener('click', closeLogTradeModal);

const journalLogBtn = document.getElementById('journal-log-trade-header-btn');
if (journalLogBtn) {
  journalLogBtn.addEventListener('click', () => {
    if (typeof openLogTradeModal === 'function') openLogTradeModal();
  });
}

// Verify confluences button listener
const btnVerifyConfluences = document.getElementById('btn-verify-confluences');
if (btnVerifyConfluences) {
  btnVerifyConfluences.addEventListener('click', performConfluenceVerification);
}

// Direction toggle
const dirButtons = document.querySelectorAll('.dir-btn');
dirButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    dirButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeDirection = btn.getAttribute('data-direction') || 'long';
  });
});

// Manual Pair Input
const tradeAssetInput = document.getElementById('trade-asset-input');

// Strategy Select
const logStrategySelect = document.getElementById('log-strategy-select');
if (logStrategySelect) {
  logStrategySelect.addEventListener('change', (e) => {
    activeStrategyKey = e.target.value;
    updateModalStrategyHeader(activeStrategyKey);
    renderConfluenceChecklist(activeStrategyKey);
  });
}

// P&L Sign Toggle (+ / -)
let activePnlSign = '+';

function setPnlSign(sign) {
  activePnlSign = (sign === '-' || sign === 'neg' || sign === 'loss') ? '-' : '+';
  document.querySelectorAll('#pnl-sign-toggle .sign-btn, .pnl-sign-toggle .sign-btn').forEach(b => {
    const s = b.getAttribute('data-sign');
    const isActive = (s === activePnlSign);
    b.classList.toggle('active', isActive);
    b.classList.remove('pos', 'neg');
    if (isActive) {
      b.classList.add(activePnlSign === '+' ? 'pos' : 'neg');
    }
  });
  if (typeof updateAccountImpactReadout === 'function') {
    updateAccountImpactReadout();
  }
}
window.setPnlSign = setPnlSign;

// Delegated click/touch handling for sign buttons to guarantee instant tapping anywhere
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#pnl-sign-toggle .sign-btn, .pnl-sign-toggle .sign-btn');
  if (btn) {
    e.preventDefault();
    const sign = btn.getAttribute('data-sign') || '+';
    setPnlSign(sign);
  }
});

// Live Multi-Account Sizing & Normalized Impact Readout
function updateAccountImpactReadout() {
  const accountSelect = document.getElementById('log-account-select');
  const riskPill = document.getElementById('log-account-risk-pill');
  const impactPercentEl = document.getElementById('account-impact-percent');
  const impactREl = document.getElementById('account-impact-r');
  const pnlInput = document.getElementById('trade-pnl-input');

  const opt = accountSelect?.options[accountSelect.selectedIndex];
  if (!opt || opt.value === '__custom_account__') return;

  const accSize = parseFloat(opt?.getAttribute('data-size')) || 100000;
  const riskPercent = parseFloat(opt?.getAttribute('data-risk')) || 1.0;
  const accCurrency = opt?.getAttribute('data-currency') || getAppCurrency().code;
  const currSym = CURRENCY_SYMBOLS[accCurrency] || getAppCurrency().symbol;
  const riskDollars = accSize * (riskPercent / 100);

  if (riskPill) {
    riskPill.textContent = `${riskPercent.toFixed(1)}% Risk (${currSym}${Math.round(riskDollars).toLocaleString()})`;
  }

  // Live Currency Symbol Prefix in the Realized P&L input wrap
  document.querySelectorAll('#log-trade-modal .currency-symbol, .dollar-input-wrap .currency-symbol').forEach(el => {
    el.textContent = currSym;
  });

  const pnlRaw = Math.abs(parseFloat(pnlInput?.value) || 0);
  const pnlFinal = activePnlSign === '-' ? -pnlRaw : pnlRaw;
  const impactPct = accSize > 0 ? ((pnlFinal / accSize) * 100) : 0;
  const rValue = riskDollars > 0 ? (pnlFinal / riskDollars) : 0;

  if (impactPercentEl) {
    const sign = impactPct > 0 ? '+' : '';
    impactPercentEl.textContent = `${sign}${impactPct.toFixed(2)}%`;
    impactPercentEl.style.color = pnlFinal > 0 ? '#10b981' : (pnlFinal < 0 ? '#f43f5e' : '#fff');
  }

  if (impactREl) {
    const rSign = rValue > 0 ? '+' : '';
    impactREl.textContent = `${rSign}${rValue.toFixed(1)}R`;
    impactREl.style.color = pnlFinal > 0 ? '#10b981' : (pnlFinal < 0 ? '#f43f5e' : '#38bdf8');
  }
}
window.updateAccountImpactReadout = updateAccountImpactReadout;

const logAccountSelect = document.getElementById('log-account-select');
if (logAccountSelect) {
  logAccountSelect.addEventListener('change', () => {
    if (logAccountSelect.value === '__custom_account__') {
      const editor = document.getElementById('account-quick-editor');
      if (editor) editor.style.display = 'block';
    } else {
      updateAccountImpactReadout();
    }
  });
}

const tradePnlInput = document.getElementById('trade-pnl-input');
if (tradePnlInput) {
  tradePnlInput.addEventListener('input', () => {
    let raw = tradePnlInput.value;
    if (typeof raw === 'string') {
      if (raw.includes('-')) {
        setPnlSign('-');
        tradePnlInput.value = raw.replace(/-/g, '');
      } else if (raw.includes('+')) {
        setPnlSign('+');
        tradePnlInput.value = raw.replace(/\+/g, '');
      }
    }
    updateAccountImpactReadout();
  });
}

// Quick Account Size & Currency Editor Controller
function initQuickAccountEditor() {
  const toggleBtn = document.getElementById('account-edit-toggle-btn');
  const editorPanel = document.getElementById('account-quick-editor');
  const closeBtn = document.getElementById('account-editor-close-btn');
  const applyBtn = document.getElementById('quick-account-apply-btn');
  const saveNewBtn = document.getElementById('quick-account-save-as-new-btn');
  const sizeInput = document.getElementById('quick-account-size-input');
  const riskInput = document.getElementById('quick-account-risk-input');
  const currSelect = document.getElementById('quick-account-currency-select');
  const nameInput = document.getElementById('quick-account-name-input');
  const currTag = document.getElementById('quick-edit-curr-tag');
  const accountSelect = document.getElementById('log-account-select');

  function openEditor() {
    if (!editorPanel) return;
    const selectedOpt = accountSelect?.options[accountSelect.selectedIndex];
    const isCustom = selectedOpt?.value === '__custom_account__';

    const currentSize = isCustom ? 50000 : (parseFloat(selectedOpt?.getAttribute('data-size')) || 100000);
    const currentRisk = isCustom ? 1.0 : (parseFloat(selectedOpt?.getAttribute('data-risk')) || 1.0);
    const currentCurr = isCustom ? getAppCurrency().code : (selectedOpt?.getAttribute('data-currency') || getAppCurrency().code);
    const currentName = isCustom ? 'Custom Account' : (selectedOpt?.getAttribute('data-name')?.replace(/\s*\(.*\)$/, '') || 'My Account');

    if (sizeInput) sizeInput.value = currentSize;
    if (riskInput) riskInput.value = currentRisk;
    if (currSelect) currSelect.value = currentCurr;
    if (nameInput) nameInput.value = currentName;
    if (currTag) currTag.textContent = CURRENCY_SYMBOLS[currentCurr] || '$';

    editorPanel.style.display = 'block';
  }

  function closeEditor() {
    if (!editorPanel) return;
    editorPanel.style.display = 'none';
    if (accountSelect && accountSelect.value === '__custom_account__') {
      accountSelect.selectedIndex = 0;
      updateAccountImpactReadout();
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (editorPanel && editorPanel.style.display === 'block') {
        closeEditor();
      } else {
        openEditor();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeEditor();
    });
  }

  if (currSelect) {
    currSelect.addEventListener('change', () => {
      const sym = CURRENCY_SYMBOLS[currSelect.value] || '$';
      if (currTag) currTag.textContent = sym;
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const accounts = getTradingAccounts();
      const selectedId = accountSelect?.value;
      const targetAcc = accounts.find(a => a.id === selectedId) || accounts[0];

      const newSize = parseFloat(sizeInput?.value) || 100000;
      const newRisk = parseFloat(riskInput?.value) || 1.0;
      const newCurr = currSelect?.value || 'USD';
      const newName = nameInput?.value?.trim() || targetAcc.name || 'Trading Account';

      targetAcc.name = newName;
      targetAcc.size = newSize;
      targetAcc.risk = newRisk;
      targetAcc.currency = newCurr;

      saveTradingAccounts(accounts);
      saveUserPreferences({ currency: newCurr, accountSize: newSize, riskPerTrade: newRisk });
      populateAccountSelects(targetAcc.id);
      closeEditor();
      updateAccountImpactReadout();

      if (typeof showAppToast === 'function') {
        showAppToast({
          title: 'Account Context Updated',
          message: `${newName} set to ${CURRENCY_SYMBOLS[newCurr] || '$'}${newSize.toLocaleString()} (${newRisk}% Risk)`,
          type: 'success',
          duration: 3500
        });
      }
    });
  }

  if (saveNewBtn) {
    saveNewBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const accounts = getTradingAccounts();
      const newSize = parseFloat(sizeInput?.value) || 100000;
      const newRisk = parseFloat(riskInput?.value) || 1.0;
      const newCurr = currSelect?.value || 'USD';
      const newName = nameInput?.value?.trim() || `Account ${accounts.length + 1}`;
      const newId = `acc_${Date.now()}`;

      const newAcc = {
        id: newId,
        name: newName,
        size: newSize,
        risk: newRisk,
        currency: newCurr
      };

      accounts.push(newAcc);
      saveTradingAccounts(accounts);
      saveUserPreferences({ currency: newCurr });
      populateAccountSelects(newId);
      closeEditor();
      updateAccountImpactReadout();

      if (typeof showAppToast === 'function') {
        showAppToast({
          title: 'New Account Created',
          message: `${newName} (${CURRENCY_SYMBOLS[newCurr] || '$'}${newSize.toLocaleString()}) added and selected.`,
          type: 'success',
          duration: 3500
        });
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    populateAccountSelects();
    initQuickAccountEditor();
  });
} else {
  populateAccountSelects();
  initQuickAccountEditor();
}

// TradingView Screenshot Preview & Paste
const tvScreenshotInput = document.getElementById('trade-screenshot-url');
const pasteTvBtn = document.getElementById('paste-tv-btn');
const tvPreviewCapsule = document.getElementById('screenshot-preview-capsule');
const tvExternalLink = document.getElementById('screenshot-external-link');
const tvPreviewText = document.getElementById('preview-url-text');

function updateTvPreview(url) {
  const cleanUrl = (url || '').trim();
  if (tvPreviewCapsule) {
    if (cleanUrl && (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://'))) {
      tvPreviewCapsule.style.display = 'flex';
      if (tvExternalLink) tvExternalLink.href = cleanUrl;
      if (tvPreviewText) tvPreviewText.textContent = cleanUrl.length > 34 ? cleanUrl.substring(0, 32) + '...' : cleanUrl;
    } else {
      tvPreviewCapsule.style.display = 'none';
    }
  }
}

if (tvScreenshotInput) {
  tvScreenshotInput.addEventListener('input', (e) => {
    updateTvPreview(e.target.value);
  });
}

if (pasteTvBtn && tvScreenshotInput) {
  pasteTvBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          tvScreenshotInput.value = text.trim();
          updateTvPreview(text.trim());
          return;
        }
      }
    } catch (e) {
      console.warn('Clipboard read failed', e);
    }
    const manual = prompt('Paste TradingView snapshot link:');
    if (manual) {
      tvScreenshotInput.value = manual.trim();
      updateTvPreview(manual.trim());
    }
  });
}

// Debrief & Retrospective Controls in Log Trade Modal
function initLogTradeDebriefControls() {
  const gradeBtns = document.querySelectorAll('#log-debrief-grades-picker .debrief-grade-btn');
  gradeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      gradeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeLogGrade = btn.getAttribute('data-grade') || 'A+';
      activeLogGradeTitle = btn.getAttribute('data-title') || 'Execution Grade';
      isLogGradeManuallySet = true;
    });
  });

  const emotionPills = document.querySelectorAll('#log-debrief-emotion-picker .debrief-pill');
  emotionPills.forEach(pill => {
    pill.addEventListener('click', () => {
      emotionPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeLogEmotion = pill.getAttribute('data-emotion') || 'Calm & Patient';
    });
  });

  const exitPills = document.querySelectorAll('#log-debrief-exit-picker .debrief-pill');
  exitPills.forEach(pill => {
    pill.addEventListener('click', () => {
      exitPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeLogExit = pill.getAttribute('data-exit') || 'Target Hit';
    });
  });
}
initLogTradeDebriefControls();

// Form submission & Live Dashboard updates
const logTradeForm = document.getElementById('log-trade-form');
if (logTradeForm) {
  logTradeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const manualAsset = document.getElementById('trade-asset-input')?.value?.trim().toUpperCase();
    const asset = manualAsset || document.querySelector('#log-asset-group .pill.active')?.getAttribute('data-asset') || 'XAUUSD';
    const direction = activeDirection.toUpperCase();
    const strategyName = tradeStrategies[activeStrategyKey]?.name || 'A+ Setup Reversal';
    
    // Automatically perform verification if user hasn't tapped verify yet
    if (!isConfluencesVerified) {
      performConfluenceVerification();
    }

    // Check compliance
    const rows = document.querySelectorAll('.confluence-item-row');
    const total = rows.length;
    let met = 0;
    rows.forEach(r => { if (r.classList.contains('checked')) met++; });
    const isCompliant = (met === total && total > 0);

    const accountSelect = document.getElementById('log-account-select');
    const selectedOpt = accountSelect?.options[accountSelect.selectedIndex];
    const accountId = accountSelect?.value || 'acc_funded_100k';
    const accountName = selectedOpt?.getAttribute('data-name') || 'Funded Prop ($100k)';
    const accountSize = parseFloat(selectedOpt?.getAttribute('data-size')) || 100000;
    const accountRiskPct = parseFloat(selectedOpt?.getAttribute('data-risk')) || 1.0;
    const riskDollarAmount = accountSize * (accountRiskPct / 100);

    const pnlRaw = Math.abs(parseFloat(document.getElementById('trade-pnl-input')?.value) || 0);
    const pnlFinal = activePnlSign === '-' ? -pnlRaw : pnlRaw;
    const pnlPercent = accountSize > 0 ? parseFloat(((pnlFinal / accountSize) * 100).toFixed(2)) : 0;

    let rMultiple = '0.0R';
    if (riskDollarAmount > 0) {
      const rNum = pnlFinal / riskDollarAmount;
      const rSign = rNum > 0 ? '+' : '';
      rMultiple = `${rSign}${rNum.toFixed(1)}R`;
    } else {
      rMultiple = pnlFinal >= 0 ? '+2.0R' : '-1.0R';
    }

    const screenshotUrl = document.getElementById('trade-screenshot-url')?.value?.trim() || '';
    const breachReasonSelect = document.getElementById('breach-reason-select');
    const breachReason = (!isCompliant && breachReasonSelect) ? breachReasonSelect.value : '';

    const confluencesList = [];
    rows.forEach(r => {
      const text = r.querySelector('span')?.textContent?.trim();
      if (text) {
        confluencesList.push(r.classList.contains('checked') ? text : `${text} (MISSED)`);
      }
    });

    const debriefLessons = document.getElementById('log-debrief-lessons-input')?.value?.trim() || '';

    const debriefData = {
      grade: activeLogGrade || (isCompliant ? 'A+' : 'F'),
      title: activeLogGradeTitle || (isCompliant ? 'Flawless Discipline' : 'Rule Breach Detected'),
      emotion: activeLogEmotion || 'Calm & Patient',
      exitQuality: activeLogExit || 'Target Hit Exactly',
      lessons: debriefLessons
    };

    // Create trade object
    const newTrade = {
      id: Date.now(),
      asset,
      direction: activeDirection,
      entryPrice: Math.abs(pnlFinal) || 0,
      createdAt: new Date().toISOString(),
      strategy: strategyName,
      strategyKey: activeStrategyKey,
      outcome: pnlFinal >= 0 ? 'win' : 'loss',
      pnl: pnlFinal,
      pnlPercent,
      rMultiple,
      accountId,
      accountName,
      accountSize,
      accountRiskPct,
      currency: selectedOpt?.getAttribute('data-currency') || getAppCurrency().code,
      currencySymbol: CURRENCY_SYMBOLS[selectedOpt?.getAttribute('data-currency')] || getAppCurrency().symbol,
      confluencesMet: met,
      totalConfluences: total,
      confluences: confluencesList,
      isCompliant,
      breachReason,
      screenshotUrl,
      debrief: debriefData,
      retrospective: debriefLessons,
      notes: debriefLessons || (isCompliant ? 'Executed with 100% adherence to playbook confluences.' : `Rule breach detected: ${breachReason || 'Confluences missed'}`),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: getUserPreferences().timezone }),
      timestamp: Date.now()
    };

    // Store in localStorage for Journal
    try {
      const stored = JSON.parse(localStorage.getItem('dma_trades') || '[]');
      stored.unshift(newTrade);
      localStorage.setItem('dma_trades', JSON.stringify(stored));
    } catch (err) {
      console.warn('Storage error', err);
    }

    // Persist Debrief lookup in dma_trade_debriefs for instant Inspector access
    try {
      const storedDebriefs = JSON.parse(localStorage.getItem('dma_trade_debriefs') || '{}');
      storedDebriefs[newTrade.id] = debriefData;
      localStorage.setItem('dma_trade_debriefs', JSON.stringify(storedDebriefs));
    } catch (_) {}

    // Persist to Firebase Firestore Backend
    if (window.DMA_DB && typeof window.DMA_DB.saveTrade === 'function') {
      window.DMA_DB.saveTrade(newTrade).catch(err => {
        console.warn('[DMA Backend] Firestore saveTrade error:', err);
      });
    }

    // Live update on app.html dashboard cards if present
    if (typeof window.updateDashboardMetrics === 'function') {
      window.updateDashboardMetrics();
    }
    // Live update on journal.html if present
    if (typeof window.refreshJournal === 'function') {
      window.refreshJournal();
    }
    // Live update on playbook grid if present
    if (typeof window.refreshPlaybookGrid === 'function') {
      window.refreshPlaybookGrid(true);
    }

    closeLogTradeModal();

    // Feedback Alert via in-app toast
    if (isCompliant) {
      showAppToast({
        title: 'Audited Trade Committed!',
        message: `${asset} ${direction} (${formatMoney(pnlFinal)})\nGrade: ${debriefData.grade} (${debriefData.emotion}) · 100% Plan Compliance (${met}/${total} Confluences Verified).`,
        type: 'success',
        duration: 5000
      });
    } else {
      showAppToast({
        title: 'Trade Logged (Rule Breach)',
        message: `${asset} ${direction} (${formatMoney(pnlFinal)})\nGrade: ${debriefData.grade} (${debriefData.emotion}) · Missing ${total - met} of ${total} confluences. Logged under Rules Broken.`,
        type: 'warning',
        duration: 5500
      });
    }
  });
}

// Local storage trade rendering & journal interactions are managed by initJournalModule()

// ==========================================================================
// PWA DRAFT PERSISTENCE & MULTITASKING BACKGROUND RESILIENCE
// Prevents active trade drafts and forms from vanishing when minimizing the app
// ==========================================================================
function saveTradeDraft() {
  const modal = document.getElementById('log-trade-modal');
  if (!modal || !modal.classList.contains('open')) return;

  const assetInput = document.getElementById('trade-asset-input');
  const strategySelect = document.getElementById('log-strategy-select');
  const pnlInput = document.getElementById('trade-pnl-input');
  const screenshotInput = document.getElementById('trade-screenshot-url');
  const lessonsInput = document.getElementById('log-debrief-lessons-input');
  const activeDirBtn = document.querySelector('.dir-btn.active');
  const signToggle = document.getElementById('pnl-sign-toggle');

  const checkedIndices = [];
  document.querySelectorAll('.confluence-item-row').forEach(row => {
    if (row.classList.contains('checked')) {
      checkedIndices.push(row.getAttribute('data-idx'));
    }
  });

  const draft = {
    isOpen: true,
    account: document.getElementById('log-account-select')?.value || 'acc_funded_100k',
    asset: assetInput ? assetInput.value : '',
    strategy: strategySelect ? strategySelect.value : '',
    direction: activeDirBtn ? activeDirBtn.getAttribute('data-direction') : 'long',
    pnl: pnlInput ? pnlInput.value : '',
    pnlSign: activePnlSign || '+',
    screenshot: screenshotInput ? screenshotInput.value : '',
    grade: typeof activeLogGrade !== 'undefined' ? activeLogGrade : 'A+',
    gradeTitle: typeof activeLogGradeTitle !== 'undefined' ? activeLogGradeTitle : '',
    emotion: typeof activeLogEmotion !== 'undefined' ? activeLogEmotion : 'Calm & Patient',
    exit: typeof activeLogExit !== 'undefined' ? activeLogExit : 'Target Hit',
    lessons: lessonsInput ? lessonsInput.value : '',
    checkedIndices: checkedIndices,
    savedAt: Date.now()
  };

  try {
    localStorage.setItem('dma_active_trade_draft', JSON.stringify(draft));
  } catch (_) {}
}

function restoreTradeDraft() {
  try {
    const raw = localStorage.getItem('dma_active_trade_draft');
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (!draft || !draft.isOpen) return;

    // Discard drafts older than 12 hours
    if (Date.now() - draft.savedAt > 12 * 60 * 60 * 1000) {
      localStorage.removeItem('dma_active_trade_draft');
      return;
    }

    const modal = document.getElementById('log-trade-modal');
    const backdrop = document.getElementById('log-trade-backdrop');
    if (!modal || !backdrop) return;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (draft.strategy) {
      activeStrategyKey = draft.strategy;
      const strategySelect = document.getElementById('log-strategy-select');
      if (strategySelect) strategySelect.value = draft.strategy;
      if (typeof updateModalStrategyHeader === 'function') updateModalStrategyHeader(draft.strategy);
      if (typeof renderConfluenceChecklist === 'function') renderConfluenceChecklist(draft.strategy);
    }

    const assetInput = document.getElementById('trade-asset-input');
    if (assetInput && draft.asset) assetInput.value = draft.asset;

    const accountSelect = document.getElementById('log-account-select');
    if (accountSelect && draft.account) {
      accountSelect.value = draft.account;
    }
    if (typeof updateAccountImpactReadout === 'function') {
      updateAccountImpactReadout();
    }

    if (draft.direction) {
      document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-direction') === draft.direction);
      });
      activeDirection = draft.direction;
    }

    const pnlInput = document.getElementById('trade-pnl-input');
    if (pnlInput && draft.pnl) pnlInput.value = draft.pnl;

    if (draft.pnlSign && typeof setPnlSign === 'function') {
      setPnlSign(draft.pnlSign);
    }

    const screenshotInput = document.getElementById('trade-screenshot-url');
    if (screenshotInput && draft.screenshot) screenshotInput.value = draft.screenshot;

    const lessonsInput = document.getElementById('log-debrief-lessons-input');
    if (lessonsInput && draft.lessons) lessonsInput.value = draft.lessons;

    if (draft.grade) {
      activeLogGrade = draft.grade;
      activeLogGradeTitle = draft.gradeTitle || '';
      document.querySelectorAll('#log-debrief-grades-picker .debrief-grade-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-grade') === draft.grade);
      });
    }

    if (draft.emotion) {
      activeLogEmotion = draft.emotion;
      document.querySelectorAll('#log-debrief-emotion-picker .debrief-pill').forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-emotion') === draft.emotion);
      });
    }

    if (draft.exit) {
      activeLogExit = draft.exit;
      document.querySelectorAll('#log-debrief-exit-picker .debrief-pill').forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-exit') === draft.exit);
      });
    }

    if (Array.isArray(draft.checkedIndices)) {
      document.querySelectorAll('.confluence-item-row').forEach(row => {
        if (draft.checkedIndices.includes(row.getAttribute('data-idx'))) {
          row.classList.add('checked');
        }
      });
      if (typeof onConfluenceRowToggled === 'function') onConfluenceRowToggled();
    }
  } catch (err) {
    console.warn('[PWA] Restore draft warning:', err);
  }
}

// Remember current active page route
try {
  let currentPath = window.location.pathname.split('/').pop() || 'index';
  currentPath = currentPath.replace(/\.html$/i, '');
  if (currentPath && currentPath !== 'login' && currentPath !== 'signup') {
    localStorage.setItem('dma_last_active_route', currentPath);
  }
} catch (_) {}

// Lifecycle listeners for multitasking / phone minimize / tab switching
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    saveTradeDraft();
  } else if (document.visibilityState === 'visible') {
    restoreTradeDraft();
    // Silently sync background cloud data without full-page reloads
    if (window.DMA_DB && window.firebaseAuth?.currentUser) {
      window.DMA_DB.syncUserData(window.firebaseAuth.currentUser.uid);
    }
  }
});

window.addEventListener('pagehide', () => {
  saveTradeDraft();
});

window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    console.log('[PWA] Resumed from Back-Forward Cache (bfcache)');
  }
  restoreTradeDraft();
});

// Restore on initial load if user reopened browser tab with open draft
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', restoreTradeDraft);
} else {
  restoreTradeDraft();
}


// ==========================================================================
// PLAYBOOK BENCHMARKS, REGISTRY & DYNAMIC RENDERING ENGINE
// ==========================================================================
const benchmarkPlaybooks = {
  reversal: {
    id: 'reversal',
    name: 'A+ Setup Reversal',
    setupType: 'reversal',
    isSample: true,
    targetRr: '1:2.5+',
    timeframe: 'M15 / H4',
    confluences: [
      '4H Key S/R Level or Liquidity Pool swept',
      '15M Market Structure Shift (MSS) with displacement candle',
      'Order Block or Fair Value Gap (FVG) retest established',
      'Strict 1:2.5 minimum Risk-to-Reward profile'
    ],
    thesis: 'Trade higher timeframe liquidity sweeps accompanied by lower timeframe market structure shifts.',
    wr: '68.4%',
    tradesCount: 42,
    followedWR: '76.2%',
    brokenWR: '22.0%',
    followedBar: '76.2%',
    brokenBar: '22.0%',
    followedMeta: '32 Wins of 42 Trades',
    brokenMeta: '2 Wins of 9 Trades',
    multiplier: '3.5x Higher Win Rate',
    pnl: '+$3,450',
    potentialPnl: '+$4,200',
    actualPnl: '+$3,450',
    svgFollowed: '0,55 50,45 100,30 150,22 200,15 250,8 300,4',
    svgActual: '0,55 50,48 100,40 150,45 200,32 250,38 300,24'
  },
  trend: {
    id: 'trend',
    name: 'Trend Continuation',
    setupType: 'trend',
    isSample: true,
    targetRr: '1:2.0+',
    timeframe: 'H1 / D1',
    confluences: [
      'Daily & 4H Trend Alignment confirmed (Higher Highs / Lower Lows)',
      'Break of Structure (BOS) with clear volume expansion',
      'Entry strictly inside Discount zone (<50% Fib retracement)'
    ],
    thesis: 'Enter in the direction of the dominant macro trend after a corrective pullback into a high-probability discount Fibonacci zone.',
    wr: '54.0%',
    tradesCount: 35,
    followedWR: '68.0%',
    brokenWR: '31.5%',
    followedBar: '68.0%',
    brokenBar: '31.5%',
    followedMeta: '24 Wins of 35 Trades',
    brokenMeta: '4 Wins of 13 Trades',
    multiplier: '2.2x Higher Win Rate',
    pnl: '+$1,820',
    potentialPnl: '+$2,600',
    actualPnl: '+$1,820',
    svgFollowed: '0,55 50,48 100,38 150,28 200,20 250,14 300,8',
    svgActual: '0,55 50,52 100,45 150,50 200,38 250,44 300,30'
  },
  breakout: {
    id: 'breakout',
    name: 'London Open Breakout',
    setupType: 'breakout',
    isSample: true,
    targetRr: '1:3.0',
    timeframe: 'M5 / M15',
    confluences: [
      'Asian session range strictly under 35 pips',
      'Pre-London Judas Swing / Fakeout swept',
      '08:00–08:30 GMT displacement candle outside range',
      'Stop loss tucked behind Judas swing low/high'
    ],
    thesis: 'Capture explosive directional expansion following Asian session range contraction during London bell open.',
    wr: '71.4%',
    tradesCount: 28,
    followedWR: '80.0%',
    brokenWR: '25.0%',
    followedBar: '80.0%',
    brokenBar: '25.0%',
    followedMeta: '20 Wins of 28 Trades',
    brokenMeta: '1 Win of 4 Trades',
    multiplier: '3.2x Higher Win Rate',
    pnl: '+$2,190',
    potentialPnl: '+$2,750',
    actualPnl: '+$2,190',
    svgFollowed: '0,55 50,40 100,28 150,18 200,12 250,6 300,2',
    svgActual: '0,55 50,46 100,38 150,32 200,26 250,30 300,18'
  }
};

const playbookRegistry = {};

/**
 * Returns effective playbooks (custom user playbooks only)
 */
function getEffectivePlaybooks() {
  const deletedIds = JSON.parse(localStorage.getItem('dma_deleted_playbooks') || '[]').map(String);
  const customSaved = JSON.parse(localStorage.getItem('dma_custom_playbooks') || '[]');

  const list = [];

  // Include user custom playbooks
  customSaved.forEach(cp => {
    const cpId = String(cp.id || cp.key || '').trim();
    if (!cpId) return;
    if (!deletedIds.includes(cpId) && !list.some(item => String(item.id) === cpId)) {
      const normalizedCp = { ...cp, id: cpId };
      list.push(normalizedCp);
      playbookRegistry[cpId] = normalizedCp;
      if (cp.id !== cpId) playbookRegistry[cp.id] = normalizedCp;
      tradeStrategies[cpId] = {
        name: normalizedCp.name,
        confluences: normalizedCp.confluences
      };
    }
  });

  return list;
}

let lastRenderedPlaybooksHash = null;

/**
 * Computes statistical metrics for a specific playbook based on real logged user trades
 */
function getPlaybookRealStats(playbookId, playbookName, setupType) {
  let trades = [];
  try {
    trades = JSON.parse(localStorage.getItem('dma_trades') || '[]');
  } catch (_) {}

  const pbTrades = trades.filter(t => {
    if (!t) return false;
    if (t.strategyKey && String(t.strategyKey) === String(playbookId)) return true;
    if (t.strategy && playbookName && t.strategy.toLowerCase() === playbookName.toLowerCase()) return true;
    if (setupType && String(t.strategyKey) === String(setupType) && !String(t.strategyKey).startsWith('custom_')) return true;
    return false;
  });

  const tradesCount = pbTrades.length;
  let wins = 0;
  let totalPnl = 0;
  let followedCount = 0;
  let followedWins = 0;
  let brokenCount = 0;
  let brokenWins = 0;

  pbTrades.forEach(t => {
    const pnl = Number(t.pnl) || 0;
    totalPnl += pnl;
    const isWin = pnl > 0 || t.outcome === 'win';
    if (isWin) wins++;

    if (t.isCompliant) {
      followedCount++;
      if (isWin) followedWins++;
    } else {
      brokenCount++;
      if (isWin) brokenWins++;
    }
  });

  const wrNum = tradesCount > 0 ? Math.round((wins / tradesCount) * 100) : 0;
  const wrStr = tradesCount > 0 ? `${wrNum}%` : '--%';
  const pnlStr = tradesCount > 0 
    ? (totalPnl >= 0 ? `+$${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-$${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    : '$0.00';

  const followedWRNum = followedCount > 0 ? Math.round((followedWins / followedCount) * 100) : 0;
  const followedWRStr = followedCount > 0 ? `${followedWRNum}%` : '--%';
  const brokenWRNum = brokenCount > 0 ? Math.round((brokenWins / brokenCount) * 100) : 0;
  const brokenWRStr = brokenCount > 0 ? `${brokenWRNum}%` : '--%';

  let multiplier = '-- Discipline Multiplier';
  if (brokenWRNum > 0) {
    const mult = (followedWRNum / brokenWRNum).toFixed(1);
    multiplier = `${mult}x Higher Win Rate`;
  } else if (followedWRNum > 0) {
    multiplier = `+${followedWRNum}% Followed Edge`;
  }

  let svgFollowed = '0,32 300,32';
  let svgActual = '0,32 300,32';
  if (tradesCount > 0) {
    let cum = 32;
    const pts = [`0,32`];
    const step = Math.max(15, Math.floor(300 / Math.max(1, Math.min(10, tradesCount))));
    pbTrades.slice(0, 10).forEach((t, i) => {
      const p = Number(t.pnl) || 0;
      cum = Math.max(8, Math.min(56, cum - (p >= 0 ? 6 : -6)));
      pts.push(`${Math.min(300, (i + 1) * step)},${cum}`);
    });
    svgActual = pts.join(' ');
    svgFollowed = pts.map(pt => {
      const parts = pt.split(',');
      return `${parts[0]},${Math.max(6, Number(parts[1]) - 6)}`;
    }).join(' ');
  }

  return {
    tradesCount,
    tradesCountStr: `${tradesCount} Trade${tradesCount === 1 ? '' : 's'}`,
    wins,
    losses: tradesCount - wins,
    wrNum,
    wrStr,
    totalPnl,
    pnlStr,
    followedCount,
    followedWins,
    followedWRNum,
    followedWRStr,
    brokenCount,
    brokenWins,
    brokenWRNum,
    brokenWRStr,
    followedMeta: tradesCount > 0 ? `${followedWins} Wins of ${followedCount} Trades` : 'No trades logged',
    brokenMeta: tradesCount > 0 ? `${brokenWins} Wins of ${brokenCount} Trades` : 'No breaches logged',
    multiplier,
    svgFollowed,
    svgActual
  };
}
window.getPlaybookRealStats = getPlaybookRealStats;

/**
 * Renders playbooks on app.html dashboard with cache guard to eliminate re-render twitch
 */
function renderDashboardPlaybooks(force = false) {
  const container = document.getElementById('playbook-cards-list');
  if (!container) return;

  const playbooks = getEffectivePlaybooks();
  const currentHash = JSON.stringify(playbooks.map(p => ({
    id: String(p.id),
    name: p.name,
    wr: p.wr,
    pnl: p.pnl,
    type: p.setupType,
    targetRr: p.targetRr || p.targetRR || '1:2.5',
    confluences: p.confluences || []
  })));

  if (!force && (container.children?.length || 0) > 0 && lastRenderedPlaybooksHash === currentHash) {
    return; // Data has not changed, do NOT wipe DOM and cause layout twitch
  }
  lastRenderedPlaybooksHash = currentHash;

  container.innerHTML = '';

  if (playbooks.length === 0) {
    const emptyBox = document.createElement('div');
    emptyBox.className = 'empty-playbook-box';
    emptyBox.innerHTML = `
      <div class="empty-pb-icon">📋</div>
      <h4 class="empty-pb-title">No Active Playbooks</h4>
      <p class="empty-pb-desc">New account initialized. Build your custom setup with mandatory rules to begin trading systematically.</p>
      <div class="empty-pb-actions">
        <button type="button" class="btn btn-primary btn-sm" id="empty-create-pb-btn">+ Create Setup</button>
      </div>
    `;
    container.appendChild(emptyBox);

    const createBtn = emptyBox.querySelector('#empty-create-pb-btn');
    if (createBtn) createBtn.addEventListener('click', () => openChecklistCreatorModal());
    return;
  }

  playbooks.forEach(pb => {
    const card = document.createElement('div');
    card.className = 'checklist-card';
    card.setAttribute('data-playbook-id', pb.id);
    const realStats = getPlaybookRealStats(pb.id, pb.name, pb.setupType);
    const wrText = realStats.tradesCount > 0 ? `${realStats.wrStr} WR` : '--% WR';

    card.innerHTML = `
      <div class="card-info">
        <h4>${pb.name}</h4>
        <span class="card-meta">${pb.confluences ? pb.confluences.length : 3} Confluences • ${wrText} • ${realStats.tradesCountStr}</span>
      </div>
      <button class="icon-btn action" aria-label="View Setup Details">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    `;
    card.addEventListener('click', () => openPlaybookDetailModal(pb.id));
    container.appendChild(card);
  });
}
window.renderDashboardPlaybooks = renderDashboardPlaybooks;
window.getEffectivePlaybooks = getEffectivePlaybooks;

let activeInspectingPlaybookId = 'reversal';

// Open Playbook Detail Modal (Visual Divergence)
function openPlaybookDetailModal(playbookId) {
  const modal = document.getElementById('playbook-detail-modal');
  const backdrop = document.getElementById('playbook-detail-backdrop');
  if (!modal || !backdrop) return;

  const targetId = (playbookId != null && String(playbookId).trim() !== '') ? String(playbookId).trim() : null;
  if (!targetId) return;

  let pb = playbookRegistry[targetId] || playbookRegistry[playbookId];
  if (!pb) {
    try {
      const customSaved = JSON.parse(localStorage.getItem('dma_custom_playbooks') || '[]');
      pb = customSaved.find(p => String(p.id) === targetId || String(p.key) === targetId);
      if (pb) playbookRegistry[targetId] = pb;
    } catch (_) {}
  }
  if (!pb && typeof benchmarkPlaybooks !== 'undefined' && benchmarkPlaybooks[targetId]) {
    pb = benchmarkPlaybooks[targetId];
    playbookRegistry[targetId] = pb;
  }
  if (!pb && typeof tradeStrategies !== 'undefined' && tradeStrategies[targetId]) {
    const ts = tradeStrategies[targetId];
    pb = {
      id: targetId,
      name: ts.name,
      setupType: targetId === 'trend' ? 'trend' : (targetId === 'breakout' ? 'breakout' : 'reversal'),
      targetRr: '1:2.5',
      confluences: ts.confluences || []
    };
    playbookRegistry[targetId] = pb;
  }
  if (!pb) return;

  activeInspectingPlaybookId = targetId;
  const realStats = getPlaybookRealStats(pb.id, pb.name, pb.setupType);

  // Header & Title
  const title = document.getElementById('pb-detail-title');
  const wrBadge = document.getElementById('pb-detail-wr');
  if (title) title.textContent = pb.name;
  if (wrBadge) wrBadge.textContent = realStats.tradesCount > 0 ? `${realStats.wrStr} WR` : '--% WR';

  // Visual Divergence Bars & Multipliers
  const statFollowed = document.getElementById('pb-detail-stat-followed');
  const barFollowed = document.getElementById('pb-bar-followed');
  const metaFollowed = document.getElementById('pb-followed-trades-meta');

  const statBroken = document.getElementById('pb-detail-stat-broken');
  const barBroken = document.getElementById('pb-bar-broken');
  const metaBroken = document.getElementById('pb-broken-trades-meta');

  const multiplierVal = document.getElementById('pb-multiplier-val');

  if (statFollowed) statFollowed.textContent = `${realStats.followedWRStr} WR`;
  if (barFollowed) barFollowed.style.width = realStats.followedCount > 0 ? `${realStats.followedWRNum}%` : '50%';
  if (metaFollowed) metaFollowed.textContent = realStats.followedMeta;

  if (statBroken) statBroken.textContent = `${realStats.brokenWRStr} WR`;
  if (barBroken) barBroken.style.width = realStats.brokenCount > 0 ? `${realStats.brokenWRNum}%` : '50%';
  if (metaBroken) metaBroken.textContent = realStats.brokenMeta;

  if (multiplierVal) multiplierVal.textContent = realStats.multiplier;

  // Sparkline Equity & P&L
  const statPnl = document.getElementById('pb-detail-stat-pnl');
  const potentialPnl = document.getElementById('pb-potential-pnl');
  const actualPnl = document.getElementById('pb-actual-pnl');
  const svgFollowed = document.getElementById('pb-svg-followed');
  const svgActual = document.getElementById('pb-svg-actual');

  if (statPnl) statPnl.textContent = `${realStats.pnlStr} Net`;
  if (potentialPnl) potentialPnl.textContent = realStats.pnlStr;
  if (actualPnl) actualPnl.textContent = realStats.pnlStr;

  if (svgFollowed) svgFollowed.setAttribute('points', realStats.svgFollowed);
  if (svgActual) svgActual.setAttribute('points', realStats.svgActual);

  // Required Confluences List
  const confCount = document.getElementById('pb-detail-conf-count');
  const rulesList = document.getElementById('pb-detail-rules-list');
  const confluences = pb.confluences || [];
  if (confCount) confCount.textContent = `${confluences.length} Required`;

  if (rulesList) {
    rulesList.innerHTML = '';
    confluences.forEach((rule, idx) => {
      const item = document.createElement('div');
      item.className = 'pb-rule-item';
      item.innerHTML = `
        <span class="pb-rule-badge">${idx + 1}</span>
        <span>${rule}</span>
      `;
      rulesList.appendChild(item);
    });
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePlaybookDetailModal() {
  const modal = document.getElementById('playbook-detail-modal');
  const backdrop = document.getElementById('playbook-detail-backdrop');
  if (!modal || !backdrop) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

// Bind Playbook cards click
function bindPlaybookCardClicks() {
  const cards = document.querySelectorAll('.checklist-card[data-playbook-id]');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      const id = card.getAttribute('data-playbook-id');
      if (id) openPlaybookDetailModal(id);
    });
  });
}

// Log trade with this setup button
const pbActionLogBtn = document.getElementById('pb-action-log-btn');
if (pbActionLogBtn) {
  pbActionLogBtn.addEventListener('click', () => {
    closePlaybookDetailModal();

    if (tradeStrategies[activeInspectingPlaybookId]) {
      activeStrategyKey = activeInspectingPlaybookId;
      const stratPills = document.querySelectorAll('#log-strategy-group .strategy-pill');
      stratPills.forEach(p => {
        if (p.getAttribute('data-strategy') === activeInspectingPlaybookId) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    }

    openLogTradeModal();
  });
}

// Edit Playbook action in detail modal
const pbEditBtn = document.getElementById('pb-edit-btn');
if (pbEditBtn) {
  pbEditBtn.addEventListener('click', () => {
    const targetId = activeInspectingPlaybookId;
    closePlaybookDetailModal();
    openChecklistCreatorModal(targetId);
  });
}

// Delete Playbook action
const pbDeleteBtn = document.getElementById('pb-delete-btn');
if (pbDeleteBtn) {
  pbDeleteBtn.addEventListener('click', async () => {
    if (!activeInspectingPlaybookId) return;

    const targetId = activeInspectingPlaybookId;
    const pb = playbookRegistry[targetId];
    const pbName = pb ? pb.name : 'this playbook';

    const confirmed = await showAppConfirm({
      title: 'Delete Playbook?',
      message: `Are you sure you want to delete "${pbName}"?\n\nThis will remove the setup and its checklist rules from your active playbooks.`,
      confirmText: 'Delete Playbook',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;

    // 1. Immediately close detail modal smoothly
    closePlaybookDetailModal();

    // 2. Delete from in-memory objects immediately
    delete playbookRegistry[targetId];
    delete tradeStrategies[targetId];

    // 3. Update localStorage immediately
    try {
      const customSaved = JSON.parse(localStorage.getItem('dma_custom_playbooks') || '[]');
      const filtered = customSaved.filter(item => String(item.id) !== String(targetId) && String(item.key) !== String(targetId));
      localStorage.setItem('dma_custom_playbooks', JSON.stringify(filtered));

      const deletedIds = JSON.parse(localStorage.getItem('dma_deleted_playbooks') || '[]');
      if (!deletedIds.map(String).includes(String(targetId))) {
        deletedIds.push(String(targetId));
        localStorage.setItem('dma_deleted_playbooks', JSON.stringify(deletedIds));
      }

      // Delete from Cloud Firestore backend
      if (window.DMA_DB && typeof window.DMA_DB.deletePlaybook === 'function') {
        window.DMA_DB.deletePlaybook(targetId);
      }
    } catch (err) {
      console.warn('Storage error during playbook delete:', err);
    }

    // 4. Force re-render grids immediately so card vanishes without reload
    if (typeof window.renderDashboardPlaybooks === 'function') {
      window.renderDashboardPlaybooks(true);
    }
    if (typeof window.refreshPlaybookGrid === 'function') {
      window.refreshPlaybookGrid(true);
    }

    // 5. Synchronize strategy choices in logger dropdown
    if (typeof loadSavedPlaybooks === 'function') {
      loadSavedPlaybooks();
    }

    showAppToast({
      title: 'Playbook Deleted',
      message: `"${pbName}" has been removed from your playbooks.`,
      type: 'info'
    });
  });
}

const closePlaybookDetailBtn = document.getElementById('close-playbook-detail-btn');
const playbookDetailBackdrop = document.getElementById('playbook-detail-backdrop');
if (closePlaybookDetailBtn) closePlaybookDetailBtn.addEventListener('click', closePlaybookDetailModal);
if (playbookDetailBackdrop) playbookDetailBackdrop.addEventListener('click', closePlaybookDetailModal);

// ==========================================================================
// CHECKLIST CREATOR & EDITOR MODAL
// ==========================================================================
let currentEditingPlaybookId = null;

function openChecklistCreatorModal(editPlaybookId = null) {
  const modal = document.getElementById('checklist-creator-modal');
  const backdrop = document.getElementById('checklist-creator-backdrop');
  if (!modal || !backdrop) return;

  const modalTitle = document.getElementById('creator-modal-title');
  const modalBadge = document.getElementById('creator-modal-badge');
  const submitBtn = document.getElementById('creator-submit-btn') || modal.querySelector('button[type="submit"]');
  const nameInput = document.getElementById('creator-setup-name');
  const rrInput = document.getElementById('creator-target-rr');
  const typePills = document.querySelectorAll('#creator-type-group .pill, #creator-type-pills .pill');

  const targetId = (editPlaybookId != null && String(editPlaybookId).trim() !== '') ? String(editPlaybookId).trim() : null;
  let pb = null;

  if (targetId) {
    if (playbookRegistry[targetId]) {
      pb = playbookRegistry[targetId];
    }
    if (!pb && playbookRegistry[editPlaybookId]) {
      pb = playbookRegistry[editPlaybookId];
    }
    if (!pb) {
      try {
        const customSaved = JSON.parse(localStorage.getItem('dma_custom_playbooks') || '[]');
        pb = customSaved.find(p => String(p.id) === targetId || String(p.key) === targetId);
        if (pb) playbookRegistry[targetId] = pb;
      } catch (_) {}
    }
    if (!pb && typeof benchmarkPlaybooks !== 'undefined' && benchmarkPlaybooks[targetId]) {
      pb = benchmarkPlaybooks[targetId];
      playbookRegistry[targetId] = pb;
    }
    if (!pb && typeof tradeStrategies !== 'undefined' && tradeStrategies[targetId]) {
      const ts = tradeStrategies[targetId];
      pb = {
        id: targetId,
        name: ts.name,
        setupType: targetId === 'trend' ? 'trend' : (targetId === 'breakout' ? 'breakout' : 'reversal'),
        targetRr: '1:2.5',
        confluences: ts.confluences || []
      };
      playbookRegistry[targetId] = pb;
    }
  }

  if (targetId && pb) {
    currentEditingPlaybookId = targetId;

    if (modalTitle) modalTitle.textContent = 'EDIT PLAYBOOK MODEL';
    if (modalBadge) {
      modalBadge.textContent = 'EDITING';
      modalBadge.className = 'live-compliance-badge';
    }
    if (submitBtn) submitBtn.textContent = 'UPDATE PLAYBOOK';

    if (nameInput) nameInput.value = pb.name || '';
    if (rrInput) rrInput.value = pb.targetRr || pb.targetRR || '1:2.5';

    const currentType = (pb.setupType || 'reversal').toLowerCase();
    typePills.forEach(p => {
      const pType = (p.getAttribute('data-type') || '').toLowerCase();
      p.classList.toggle('active', pType === currentType);
    });

    if (creatorRulesContainer) {
      creatorRulesContainer.innerHTML = '';
      const confluences = pb.confluences && pb.confluences.length > 0 ? pb.confluences : [''];
      confluences.forEach(rule => appendRuleRow(rule));
    }
  } else {
    currentEditingPlaybookId = null;
    if (modalTitle) modalTitle.textContent = 'NEW PLAYBOOK MODEL';
    if (modalBadge) {
      modalBadge.textContent = 'BUILDER';
      modalBadge.className = 'live-compliance-badge verified';
    }
    if (submitBtn) submitBtn.textContent = 'SAVE PLAYBOOK';

    if (nameInput) nameInput.value = '';
    if (rrInput) rrInput.value = '1:2.5';

    typePills.forEach((p, idx) => {
      p.classList.toggle('active', idx === 0);
    });

    if (creatorRulesContainer) {
      creatorRulesContainer.innerHTML = '';
      appendRuleRow('', 'e.g. 4H Key Level or Liquidity Pool swept');
      appendRuleRow('', 'e.g. 15M Market Structure Shift with displacement');
      appendRuleRow('', 'e.g. Strict 1:2.5 minimum Risk-to-Reward profile');
    }
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeChecklistCreatorModal() {
  currentEditingPlaybookId = null;
  const modal = document.getElementById('checklist-creator-modal');
  const backdrop = document.getElementById('checklist-creator-backdrop');
  if (!modal || !backdrop) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

const closeCreatorBtn = document.getElementById('close-creator-btn');
const checklistCreatorBackdrop = document.getElementById('checklist-creator-backdrop');
const headerAddChecklistBtn = document.getElementById('header-add-checklist-btn');

if (closeCreatorBtn) closeCreatorBtn.addEventListener('click', closeChecklistCreatorModal);
if (checklistCreatorBackdrop) checklistCreatorBackdrop.addEventListener('click', closeChecklistCreatorModal);
if (headerAddChecklistBtn) headerAddChecklistBtn.addEventListener('click', () => openChecklistCreatorModal());

// Dynamic Rules Builder in Creator
const creatorRulesContainer = document.getElementById('creator-rules-container');
const addRuleBtn = document.getElementById('add-confluence-rule-btn');
const ruleCountSpan = document.getElementById('creator-rule-count');

function updateRuleNumbers() {
  if (!creatorRulesContainer) return;
  const rows = creatorRulesContainer.querySelectorAll('.creator-rule-row');
  rows.forEach((row, i) => {
    const num = row.querySelector('.rule-num');
    if (num) num.textContent = i + 1;
  });
  if (ruleCountSpan) ruleCountSpan.textContent = `${rows.length} Rules`;
}

const inspiringRulePlaceholders = [
  'e.g. 4H Key Level or Liquidity Pool swept',
  'e.g. 15M Market Structure Shift with displacement',
  'e.g. Strict 1:2.5 minimum Risk-to-Reward profile',
  'e.g. Fair Value Gap (FVG) or Order Block retest',
  'e.g. No high-impact red folder news in next 30m',
  'e.g. Daily trend alignment (Bullish / Bearish)',
  'e.g. London or NY Session timing only'
];

function appendRuleRow(initialValue = '', customPlaceholder = '') {
  if (!creatorRulesContainer) return;
  const currentCount = creatorRulesContainer.querySelectorAll('.creator-rule-row').length;
  const placeholder = customPlaceholder || inspiringRulePlaceholders[currentCount % inspiringRulePlaceholders.length];

  const row = document.createElement('div');
  row.className = 'creator-rule-row';
  row.innerHTML = `
    <span class="rule-num">${currentCount + 1}</span>
    <input type="text" class="rule-input" placeholder="${String(placeholder).replace(/"/g, '&quot;')}" required>
    <button type="button" class="rule-remove-btn" aria-label="Remove">✕</button>
  `;

  const input = row.querySelector('.rule-input');
  if (input && initialValue) {
    input.value = initialValue;
  }

  row.querySelector('.rule-remove-btn').addEventListener('click', () => {
    const allRows = creatorRulesContainer.querySelectorAll('.creator-rule-row');
    if (allRows.length > 1) {
      row.remove();
      updateRuleNumbers();
    } else {
      showAppToast({
        title: 'Rule Required',
        message: 'A playbook must have at least one confluence rule.',
        type: 'warning'
      });
    }
  });

  creatorRulesContainer.appendChild(row);
  updateRuleNumbers();
}

if (addRuleBtn) {
  addRuleBtn.addEventListener('click', () => appendRuleRow(''));
}

// Initial rule remove buttons binding
if (creatorRulesContainer) {
  creatorRulesContainer.querySelectorAll('.rule-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const allRows = creatorRulesContainer.querySelectorAll('.creator-rule-row');
      if (allRows.length > 1) {
        btn.closest('.creator-rule-row').remove();
        updateRuleNumbers();
      } else {
        showAppToast({
          title: 'Rule Required',
          message: 'A playbook must have at least one confluence rule.',
          type: 'warning'
        });
      }
    });
  });
}

// Quick suggestions chips
const suggestionChips = document.querySelectorAll('.suggestion-chips .s-chip');
suggestionChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const text = chip.getAttribute('data-chip');
    if (text) appendRuleRow(text);
  });
});

// Category pills in Creator (Fixed for both #creator-type-group and #creator-type-pills)
const creatorTypePills = document.querySelectorAll('#creator-type-group .pill, #creator-type-pills .pill');
creatorTypePills.forEach(pill => {
  pill.addEventListener('click', () => {
    const parent = pill.closest('#creator-type-group') || pill.closest('#creator-type-pills');
    if (parent) {
      parent.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    } else {
      creatorTypePills.forEach(p => p.classList.remove('active'));
    }
    pill.classList.add('active');
  });
});

// RR pills in Creator
const creatorRrPills = document.querySelectorAll('#creator-rr-pills .pill');
creatorRrPills.forEach(pill => {
  pill.addEventListener('click', () => {
    creatorRrPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

// Checklist Creator Form Submission (Create & Edit Modes)
const checklistCreatorForm = document.getElementById('checklist-creator-form');
if (checklistCreatorForm) {
  checklistCreatorForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('creator-setup-name')?.value.trim();
    if (!name) return;

    const setupType = document.querySelector('#creator-type-group .pill.active, #creator-type-pills .pill.active')?.getAttribute('data-type') || 'reversal';
    const targetRr = document.getElementById('creator-target-rr')?.value.trim() || document.querySelector('#creator-rr-pills .pill.active')?.getAttribute('data-rr') || '1:2.5';

    // Collect rules
    const ruleInputs = creatorRulesContainer.querySelectorAll('.rule-input');
    const confluences = [];
    ruleInputs.forEach(inp => {
      const val = inp.value.trim();
      if (val) confluences.push(val);
    });

    if (confluences.length === 0) {
      showAppToast({
        title: 'Rules Required',
        message: 'Please add at least one confluence rule.',
        type: 'warning'
      });
      return;
    }

    if (currentEditingPlaybookId) {
      // EDIT MODE
      const targetId = String(currentEditingPlaybookId);
      let existing = playbookRegistry[targetId] || {};
      existing.id = targetId;
      existing.name = name;
      existing.setupType = setupType;
      existing.targetRr = targetRr;
      existing.confluences = confluences;
      existing.thesis = `Systematic ${setupType.toUpperCase()} playbook targeting minimum ${targetRr} Risk-to-Reward ratio.`;

      playbookRegistry[targetId] = existing;
      tradeStrategies[targetId] = {
        name,
        confluences
      };

      try {
        let customSaved = JSON.parse(localStorage.getItem('dma_custom_playbooks') || '[]');
        const idx = customSaved.findIndex(item => String(item.id) === targetId || String(item.key) === targetId);
        if (idx !== -1) {
          customSaved[idx] = { ...customSaved[idx], ...existing };
        } else {
          customSaved.push(existing);
        }
        localStorage.setItem('dma_custom_playbooks', JSON.stringify(customSaved));

        // Update trade strategy names in logged trades if any
        let trades = JSON.parse(localStorage.getItem('dma_trades') || '[]');
        let tradesModified = false;
        trades = trades.map(t => {
          if (t && String(t.strategyKey) === targetId && t.strategy !== name) {
            tradesModified = true;
            return { ...t, strategy: name };
          }
          return t;
        });
        if (tradesModified) {
          localStorage.setItem('dma_trades', JSON.stringify(trades));
        }
      } catch (err) {
        console.warn('Storage error', err);
      }

      // Synchronize dropdowns across all modals and pages
      if (typeof loadSavedPlaybooks === 'function') {
        loadSavedPlaybooks();
      }

      if (window.DMA_DB && typeof window.DMA_DB.savePlaybook === 'function') {
        window.DMA_DB.savePlaybook(existing).then(res => {
          if (res && res.isGuest) {
            showAppToast({
              title: 'Playbook Saved Locally',
              message: `"${name}" updated on this device. Sign in to sync across devices.`,
              type: 'info',
              duration: 4000
            });
          } else if (res && res.cloudSaved) {
            showAppToast({
              title: 'Playbook Saved',
              message: `"${name}" changes synced to your cloud account.`,
              type: 'success',
              duration: 3500
            });
          } else if (res && res.error) {
            const errCode = res.error.code || '';
            const isPerm = errCode === 'permission-denied';
            showAppToast({
              title: isPerm ? 'Permissions Notice' : 'Saved to Device',
              message: isPerm
                ? `Saved to device. Firestore rules rejected write.`
                : `Saved to device. Cloud sync pending.`,
              type: 'warning',
              duration: 4000
            });
          }
        }).catch(err => console.warn('Firestore update error', err));
      } else {
        showAppToast({
          title: 'Playbook Saved',
          message: `"${name}" updated successfully.`,
          type: 'success',
          duration: 3000
        });
      }

      currentEditingPlaybookId = null;
      closeChecklistCreatorModal();

      if (typeof window.renderDashboardPlaybooks === 'function') window.renderDashboardPlaybooks(true);
      if (typeof window.refreshPlaybookGrid === 'function') window.refreshPlaybookGrid(true);
      return;
    }

    // CREATE NEW MODE
    const newId = 'custom_' + Date.now();
    const newPlaybook = {
      id: newId,
      name,
      setupType,
      targetRr,
      confluences,
      thesis: `Custom ${setupType.toUpperCase()} playbook targeting minimum ${targetRr} Risk-to-Reward ratio.`,
      wr: '0.0%',
      tradesCount: 0,
      followedWR: '0.0%',
      brokenWR: '0.0%',
      pnl: '$0.00'
    };

    // Register in memory
    playbookRegistry[newId] = newPlaybook;
    tradeStrategies[newId] = {
      name: newPlaybook.name,
      confluences: newPlaybook.confluences
    };

    // Save to localStorage
    try {
      const customSaved = JSON.parse(localStorage.getItem('dma_custom_playbooks') || '[]');
      customSaved.push(newPlaybook);
      localStorage.setItem('dma_custom_playbooks', JSON.stringify(customSaved));
    } catch (err) {
      console.warn('Storage error', err);
    }

    // Persist to Cloud Firestore backend
    if (window.DMA_DB && typeof window.DMA_DB.savePlaybook === 'function') {
      window.DMA_DB.savePlaybook(newPlaybook).then(res => {
        if (res && res.isGuest) {
          showAppToast({
            title: 'Playbook Created Locally',
            message: `"${name}" is active on this device. Sign in to back up to cloud.`,
            type: 'info',
            duration: 4000
          });
        } else if (res && res.cloudSaved) {
          showAppToast({
            title: 'Playbook Created',
            message: `"${name}" added and synced to your cloud account.`,
            type: 'success',
            duration: 3500
          });
        } else if (res && res.error) {
          const errCode = res.error.code || '';
          const isPerm = errCode === 'permission-denied';
          showAppToast({
            title: isPerm ? 'Permissions Notice' : 'Saved to Device',
            message: isPerm
              ? `"${name}" saved to device. Firestore rules rejected write.`
              : `"${name}" saved to device. Cloud sync pending.`,
            type: 'warning',
            duration: 4000
          });
        }
      }).catch(err => {
        console.warn('[DMA Backend] Firestore savePlaybook error:', err);
      });
    } else {
      showAppToast({
        title: 'Playbook Created',
        message: `"${name}" added to your strategies.`,
        type: 'success',
        duration: 3000
      });
    }

    // Synchronize strategy choices across app
    if (typeof loadSavedPlaybooks === 'function') {
      loadSavedPlaybooks();
    }

    closeChecklistCreatorModal();
    if (typeof window.refreshPlaybookGrid === 'function') {
      window.refreshPlaybookGrid(true);
    }
  });
}

// Load custom playbooks and prune deleted playbooks on startup
function loadSavedPlaybooks() {
  try {
    // 1. Prune any built-in playbooks that were marked deleted
    const deletedIds = JSON.parse(localStorage.getItem('dma_deleted_playbooks') || '[]').map(String);
    deletedIds.forEach(delId => {
      delete playbookRegistry[delId];
      delete tradeStrategies[delId];
    });

    // 2. Render playbooks container on Dashboard
    if (typeof renderDashboardPlaybooks === 'function') {
      renderDashboardPlaybooks(true);
    }

    // 3. Populate strategy choices in logger
    const logStrategySelect = document.getElementById('log-strategy-select');
    if (logStrategySelect) {
      const effective = getEffectivePlaybooks();
      const currentSelected = logStrategySelect.value;
      logStrategySelect.innerHTML = '';
      if (effective.length === 0) {
        const opt = document.createElement('option');
        opt.value = 'reversal';
        opt.textContent = 'Default Confluence Checklist (4 Rules)';
        logStrategySelect.appendChild(opt);
      } else {
        effective.forEach(pb => {
          const opt = document.createElement('option');
          opt.value = pb.id;
          opt.textContent = pb.name;
          logStrategySelect.appendChild(opt);
        });
      }
      if (currentSelected && logStrategySelect.querySelector(`option[value="${currentSelected}"]`)) {
        logStrategySelect.value = currentSelected;
      }
    }
  } catch (err) {
    console.warn('Could not load playbooks', err);
  }
}
window.loadSavedPlaybooks = loadSavedPlaybooks;

// Initial bindings
loadSavedPlaybooks();

// ==========================================================================
// PLAYBOOK WORKSTATION ENGINE (FOR PLAYBOOK.HTML)
// ==========================================================================
function initPlaybookWorkstation() {
  const grid = document.getElementById('playbook-grid');
  if (!grid) return;

  const searchInput = document.getElementById('pb-search-input');
  const clearSearchBtn = document.getElementById('pb-clear-search');
  const typePills = document.querySelectorAll('#pb-category-pills .date-pill');
  const openCreatorBtn = document.getElementById('open-creator-from-header');

  let activeFilter = 'all';
  let searchQuery = '';
  let lastRenderedGridHash = null;

  function getActivePlaybooks() {
    return getEffectivePlaybooks();
  }

  function renderGrid(force = false) {
    const playbooks = getActivePlaybooks();
    const q = searchQuery.toLowerCase().trim();
    const currentHash = `${activeFilter}|${q}|${JSON.stringify(playbooks.map(p => ({
      id: String(p.id),
      name: p.name,
      wr: p.wr,
      pnl: p.pnl,
      type: p.setupType,
      targetRr: p.targetRr || p.targetRR || '1:2.5',
      confluences: p.confluences || []
    })))}`;

    if (!force && (grid.children?.length || 0) > 0 && lastRenderedGridHash === currentHash) {
      return; // Skip destructive wipe if state is identical
    }
    lastRenderedGridHash = currentHash;

    grid.innerHTML = '';
    let visibleCount = 0;
    let totalWrSum = 0;
    let totalPnlSum = 0;

    // Handle account with zero playbooks
    if (playbooks.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'empty-playbook-box';
      emptyBox.style.gridColumn = '1 / -1';
      emptyBox.style.margin = '1.5rem 0';
      emptyBox.innerHTML = `
        <div class="empty-pb-icon">📖</div>
        <h4 class="empty-pb-title">No Playbook Models</h4>
        <p class="empty-pb-desc">You haven't defined any systematic trading playbooks yet. Add your proprietary strategy to start trading with discipline.</p>
        <div class="empty-pb-actions">
          <button type="button" class="btn btn-primary btn-sm" id="pb-empty-create-btn">+ Build New Playbook</button>
        </div>
      `;
      grid.appendChild(emptyBox);

      const createBtn = emptyBox.querySelector('#pb-empty-create-btn');
      if (createBtn) createBtn.addEventListener('click', openChecklistCreatorModal);

      // Update KPI bar to clean empty values
      const kpiCount = document.getElementById('pb-kpi-count');
      const kpiWr = document.getElementById('pb-kpi-wr');
      const kpiEdge = document.getElementById('pb-kpi-edge');
      const kpiPnl = document.getElementById('pb-kpi-pnl');

      if (kpiCount) kpiCount.textContent = '0 Setups';
      if (kpiWr) kpiWr.textContent = '--% WR';
      if (kpiEdge) kpiEdge.textContent = '-- Edge';
      if (kpiPnl) {
        kpiPnl.textContent = '$0.00';
        kpiPnl.className = 'digest-val neutral';
      }
      return;
    }

    playbooks.forEach(pb => {
      const type = (pb.setupType || 'reversal').toLowerCase();
      const name = pb.name || 'Setup Model';
      const thesis = pb.thesis || '';
      const confluences = pb.confluences || [];
      const confluencesStr = confluences.join(' ').toLowerCase();

      // Real stats computed directly from user's logged trades
      const realStats = getPlaybookRealStats(pb.id, name, type);
      const wrNum = realStats.wrNum;
      const wrDisplay = realStats.tradesCount > 0 ? `${wrNum}%` : '--%';
      const tradesDisplay = realStats.tradesCountStr;
      const pnlDisplay = realStats.pnlStr;
      const pnlClean = realStats.totalPnl;

      // Filter by category
      let matchCat = true;
      if (activeFilter === 'top') matchCat = realStats.tradesCount > 0 && wrNum >= 60;
      else if (activeFilter !== 'all') matchCat = type === activeFilter;

      // Filter by search
      let matchSearch = true;
      if (q) {
        const combined = `${name.toLowerCase()} ${type} ${thesis.toLowerCase()} ${confluencesStr}`;
        matchSearch = combined.includes(q);
      }

      if (!matchCat || !matchSearch) return;

      visibleCount++;
      if (realStats.tradesCount > 0) {
        totalWrSum += wrNum;
      }
      totalPnlSum += pnlClean;

      const card = document.createElement('div');
      card.className = 'playbook-card';
      card.setAttribute('data-playbook-id', pb.id);
      card.setAttribute('data-type', type);
      card.setAttribute('data-wr', wrNum);
      card.setAttribute('data-name', name);

      const targetRr = pb.targetRr || '1:2.5';
      const timeframe = pb.timeframe || (type === 'reversal' ? 'M15 / H4' : (type === 'trend' ? 'H1 / D1' : 'M5 / M15'));

      const rulesHtml = confluences.map(c => `
        <div class="pb-card-rule-item">
          <span class="pb-rule-dot"></span>
          <span>${c}</span>
        </div>
      `).join('');

      const followedWRText = realStats.followedCount > 0 ? `${realStats.followedWRStr} WR` : '--% WR';
      const brokenWRText = realStats.brokenCount > 0 ? `${realStats.brokenWRStr} WR` : '--% WR';
      const followedPct = realStats.followedCount > 0 ? realStats.followedWRNum : 50;
      const brokenPct = realStats.brokenCount > 0 ? (100 - realStats.followedWRNum) : 50;

      card.innerHTML = `
        <div class="pb-card-header">
          <div class="pb-card-title-group">
            <h3>${name}</h3>
            <div class="pb-badges-row">
              <span class="pb-type-pill ${type}">${type.toUpperCase()}</span>
              <span class="pb-rr-badge">${targetRr} R:R</span>
              <span class="pb-rr-badge">${timeframe}</span>
            </div>
          </div>
        </div>

        <div class="pb-stats-row">
          <div class="pb-mini-stat">
            <span class="pb-mini-stat-label">WIN RATE</span>
            <span class="pb-mini-stat-val ${realStats.tradesCount > 0 && wrNum >= 60 ? 'green' : (realStats.tradesCount > 0 ? 'cyan' : '')}">${wrDisplay}</span>
          </div>
          <div class="pb-mini-stat">
            <span class="pb-mini-stat-label">TRADES</span>
            <span class="pb-mini-stat-val">${tradesDisplay}</span>
          </div>
          <div class="pb-mini-stat">
            <span class="pb-mini-stat-label">TOTAL P&L</span>
            <span class="pb-mini-stat-val ${pnlClean > 0 ? 'green' : (pnlClean < 0 ? 'red' : '')}">${pnlDisplay}</span>
          </div>
        </div>

        <div class="pb-card-divergence">
          <div class="pb-divergence-bar-wrap">
            <div class="fill-good" style="width: ${followedPct}%;"></div>
            <div class="fill-bad" style="width: ${brokenPct}%;"></div>
          </div>
          <div class="pb-divergence-text-row">
            <span class="good">✓ Followed: ${followedWRText}</span>
            <span class="bad">⚠ Broken: ${brokenWRText}</span>
          </div>
        </div>

        <div class="pb-card-rules">
          <span class="digest-label" style="text-align: left;">MANDATORY CONFLUENCE GATES (${confluences.length})</span>
          ${rulesHtml}
        </div>

        <div class="pb-card-thesis">
          "${thesis || 'Strict systematic execution following verified confluence rules.'}"
        </div>

        <div class="pb-card-actions">
          <button type="button" class="btn-inspect-pb" data-action="inspect-pb" data-id="${pb.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>INSPECT</span>
          </button>
          <button type="button" class="btn-edit-pb" data-action="edit-pb" data-id="${pb.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            <span>EDIT</span>
          </button>
          <button type="button" class="btn-trade-pb" data-action="trade-pb" data-id="${pb.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <span>TRADE</span>
          </button>
        </div>
      `;

      card.querySelector('[data-action="inspect-pb"]').addEventListener('click', (e) => {
        e.stopPropagation();
        openPlaybookDetailModal(pb.id);
      });

      card.querySelector('[data-action="edit-pb"]').addEventListener('click', (e) => {
        e.stopPropagation();
        openChecklistCreatorModal(pb.id);
      });

      card.querySelector('[data-action="trade-pb"]').addEventListener('click', (e) => {
        e.stopPropagation();
        activeStrategyKey = pb.id;
        const logStrategySelect = document.getElementById('log-strategy-select');
        if (logStrategySelect) logStrategySelect.value = pb.id;
        openLogTradeModal();
      });

      grid.appendChild(card);
    });

    // Update KPI bar
    const kpiCount = document.getElementById('pb-kpi-count');
    const kpiWr = document.getElementById('pb-kpi-wr');
    const kpiEdge = document.getElementById('pb-kpi-edge');
    const kpiPnl = document.getElementById('pb-kpi-pnl');

    if (kpiCount) kpiCount.textContent = `${visibleCount} Setup${visibleCount === 1 ? '' : 's'}`;
    if (kpiWr) {
      let activeTradedCount = 0;
      let sumWr = 0;
      playbooks.forEach(pb => {
        const st = getPlaybookRealStats(pb.id, pb.name, pb.setupType);
        if (st.tradesCount > 0) {
          activeTradedCount++;
          sumWr += st.wrNum;
        }
      });
      kpiWr.textContent = activeTradedCount > 0 ? `${(sumWr / activeTradedCount).toFixed(1)}% WR` : '--% WR';
    }
    if (kpiEdge) {
      kpiEdge.textContent = visibleCount > 0 ? 'Live Edge' : '-- Edge';
    }
    if (kpiPnl) {
      kpiPnl.textContent = totalPnlSum >= 0 ? `+$${totalPnlSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-$${Math.abs(totalPnlSum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      kpiPnl.className = `digest-val ${totalPnlSum > 0 ? 'green' : (totalPnlSum < 0 ? 'red' : 'neutral')}`;
    }

    if (visibleCount === 0) {
      const empty = document.createElement('div');
      empty.className = 'journal-empty-state';
      empty.style.gridColumn = '1 / -1';
      empty.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--ink-muted); margin-bottom: 0.75rem;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        <h4>No Playbook Setups Found</h4>
        <p>No trading models match your current filter or search criteria.</p>
        <button type="button" class="btn btn-ghost" id="pb-reset-search-btn" style="padding: 0.4rem 0.8rem; font-size: 0.75rem;">Reset Filter</button>
      `;
      grid.appendChild(empty);
      document.getElementById('pb-reset-search-btn')?.addEventListener('click', () => {
        searchQuery = '';
        activeFilter = 'all';
        if (searchInput) searchInput.value = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        typePills.forEach((p, idx) => p.classList.toggle('active', idx === 0));
        renderGrid();
      });
    }
  }

  // Bind Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      }
      renderGrid();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      clearSearchBtn.style.display = 'none';
      searchQuery = '';
      renderGrid();
    });
  }

  // Bind Category Pills
  typePills.forEach(pill => {
    pill.addEventListener('click', () => {
      typePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.getAttribute('data-pb-filter') || 'all';
      renderGrid();
    });
  });

  // Bind Header New Model button
  if (openCreatorBtn) {
    openCreatorBtn.addEventListener('click', () => {
      openChecklistCreatorModal();
    });
  }

  // Initial render
  renderGrid();

  window.refreshPlaybookGrid = renderGrid;
}

// Global Cloud Firestore Sync Listener (Debounced & Non-Destructive to eliminate UI twitch)
let syncDebounceTimer = null;
window.addEventListener('dma-data-synced', () => {
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    console.log('[DMA Backend] Cloud Firestore sync event received');
    if (typeof window.updateDashboardMetrics === 'function') {
      window.updateDashboardMetrics();
    }
    if (typeof window.renderDashboardPlaybooks === 'function') {
      window.renderDashboardPlaybooks(false);
    }
    if (typeof window.refreshPlaybookGrid === 'function') {
      window.refreshPlaybookGrid(false);
    }
    if (typeof window.refreshJournal === 'function') {
      window.refreshJournal(false);
    }
    const syncBadge = document.getElementById('cloud-sync-text');
    if (syncBadge) syncBadge.textContent = 'Cloud Synced';
  }, 60);
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlaybookWorkstation);
} else {
  initPlaybookWorkstation();
}

// ==========================================================================
// PWA SERVICE WORKER REGISTRATION & INSTALL PROMPT
// ==========================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=v9').then((reg) => {
      console.log('[PWA] ServiceWorker registered with scope:', reg.scope);
      // Force checking for updates immediately on load
      reg.update().catch(() => {});
    }).catch((err) => {
      console.log('[PWA] ServiceWorker registration failed:', err);
    });
  });

  // Seamless auto-reload when a new service worker takes control (cleans stale cache)
  let isSwRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!isSwRefreshing) {
      isSwRefreshing = true;
      console.log('[PWA] Fresh service worker activated, reloading...');
      window.location.reload();
    }
  });
}

// Capture BeforeInstallPromptEvent to offer native-like mobile install experience
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPWAInstallPrompt = e;
  window.dispatchEvent(new CustomEvent('dma-pwa-installable'));
  console.log('[PWA] App is ready to be installed on mobile');
});


