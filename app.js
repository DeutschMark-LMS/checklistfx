document.addEventListener('DOMContentLoaded', () => {
  const routeButtons = document.querySelectorAll('[data-route]');

  routeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const target = button.getAttribute('data-route');
      if (!target) return;

      event.preventDefault();
      window.location.href = target;
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
      window.location.href = 'profile.html';
    });
  }

  // Sync Firebase / active user to side drawer & headers
  function syncGlobalUserContext() {
    let user = null;
    if (typeof window.DMA_AUTH !== 'undefined') {
      user = window.DMA_AUTH.getUser();
    }
    if (!user) {
      try {
        user = JSON.parse(localStorage.getItem('dma_active_user') || localStorage.getItem('dma_user') || 'null');
      } catch (_) {}
    }
    if (user) {
      const email = user.email || 'trader@dma.com';
      const name = user.user_metadata?.full_name || email.split('@')[0] || 'Jason Trader';
      const handle = user.user_metadata?.handle ? (user.user_metadata.handle.startsWith('@') ? user.user_metadata.handle : '@' + user.user_metadata.handle) : ('@' + email.split('@')[0]);
      const initials = name.slice(0, 2).toUpperCase();

      document.querySelectorAll('#drawer-user-avatar, #profile-avatar').forEach(el => el.textContent = initials);
      document.querySelectorAll('#drawer-user-name, #profile-name-display').forEach(el => el.textContent = name);
      document.querySelectorAll('#drawer-user-email, #profile-email-display').forEach(el => el.textContent = handle);
    }
  }
  syncGlobalUserContext();
  window.addEventListener('dma-auth-changed', syncGlobalUserContext);

  const authForms = document.querySelectorAll('[data-auth-form]');
  authForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      localStorage.setItem('checklist-auth', 'true');
      window.location.href = form.dataset.redirect || 'app.html';
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

  const profileModal = document.getElementById('profile-modal');
  const profileName = document.querySelector('.profile-meta h2');
  const profileHandle = document.querySelector('.profile-meta p');

  const openProfileEditor = () => {
    if (!profileModal) return;
    profileModal.classList.remove('hidden');
    profileModal.setAttribute('aria-hidden', 'false');
  };

  const closeProfileEditor = () => {
    if (!profileModal) return;
    profileModal.classList.add('hidden');
    profileModal.setAttribute('aria-hidden', 'true');
  };

  const profileEditorButton = document.querySelector('[data-action="open-profile-editor"]');
  if (profileEditorButton) {
    profileEditorButton.addEventListener('click', openProfileEditor);
  }

  const profileEditorCloseButtons = document.querySelectorAll('[data-action="close-profile-editor"]');
  profileEditorCloseButtons.forEach((button) => {
    button.addEventListener('click', closeProfileEditor);
  });

  const saveProfileButton = document.querySelector('[data-action="save-profile-editor"]');
  if (saveProfileButton) {
    saveProfileButton.addEventListener('click', () => {
      const nextName = document.getElementById('profile-name')?.value || 'Jason Trader';
      const nextHandle = document.getElementById('profile-handle')?.value || '@jasondma';
      const nextTimezone = document.getElementById('profile-timezone')?.value || 'America/New_York';
      const nextStyle = document.getElementById('profile-style')?.value || 'Momentum + Breakout';

      if (profileName) profileName.textContent = nextName;
      if (profileHandle) profileHandle.textContent = nextHandle;

      const timezoneNode = document.querySelector('.setting-row.compact:nth-of-type(1) small');
      const styleNode = document.querySelector('.setting-row.compact:nth-of-type(2) small');

      if (timezoneNode) timezoneNode.textContent = nextTimezone;
      if (styleNode) styleNode.textContent = nextStyle;

      closeProfileEditor();
    });
  }

  if (profileModal) {
    profileModal.addEventListener('click', (event) => {
      if (event.target === profileModal) closeProfileEditor();
    });
  }

  // Allow the dashboard to open in preview mode without forcing a login redirect.
  // The login/signup pages remain available for the product flow when needed.

  // ==========================================================================
  // DASHBOARD DYNAMIC LEDGER & SAMPLE DATA BANNER
  // ==========================================================================
  function initDashboardModule() {
    const banner = document.getElementById('dashboard-sample-banner');
    const netPnlEl = document.getElementById('dashboard-net-pnl');
    if (!netPnlEl) return;

    const pill = document.getElementById('dashboard-sample-pill');
    const pillText = document.getElementById('dashboard-sample-pill-text');
    const hint = document.getElementById('dashboard-sample-hint');
    const toggleBtn = document.getElementById('dashboard-toggle-sample-btn');
    const labelFollowed = document.getElementById('dashboard-followed-pnl');
    const labelBroken = document.getElementById('dashboard-broken-pnl');
    const barGood = document.getElementById('dashboard-bar-good');
    const barBad = document.getElementById('dashboard-bar-bad');

    function updateDashboardMetrics() {
      const includeSample = localStorage.getItem('dma_include_sample_data') !== 'false';

      if (banner) {
        banner.classList.toggle('demo-active', includeSample);
      }
      if (pillText) {
        pillText.textContent = includeSample ? 'Demo Mode: Sample Trades Visible' : 'Live Ledger: Real Trades Only';
      }
      if (hint) {
        hint.textContent = includeSample 
          ? 'Viewing preloaded benchmark data alongside your trades.' 
          : 'Clean account ($0.00). Toggle sample data to explore benchmark trades.';
      }
      if (toggleBtn) {
        const toggleText = toggleBtn.querySelector('span') || toggleBtn;
        toggleText.textContent = includeSample ? 'Switch to Clean Ledger ($0.00)' : 'Enable Sample Data';
      }

      let baseNet = includeSample ? 4250 : 0;
      let baseFollowed = includeSample ? 6100 : 0;
      let baseBroken = includeSample ? -1850 : 0;

      let customTrades = [];
      try {
        customTrades = JSON.parse(localStorage.getItem('dma_trades') || '[]');
      } catch (_) {}

      let customNet = 0;
      let customFollowed = 0;
      let customBroken = 0;

      customTrades.forEach(t => {
        const pnl = Number(t.pnl) || 0;
        customNet += pnl;
        if (t.isCompliant) {
          customFollowed += (pnl > 0 ? pnl : 0);
        } else {
          customBroken += (pnl < 0 ? pnl : 0);
        }
      });

      const totalNet = baseNet + customNet;
      const totalFollowed = baseFollowed + customFollowed;
      const totalBroken = baseBroken + customBroken;
      const hasTrades = (includeSample && baseNet !== 0) || customTrades.length > 0;

      if (netPnlEl) {
        if (!hasTrades) {
          netPnlEl.textContent = '$0.00';
          netPnlEl.className = 'net-pnl neutral';
        } else {
          netPnlEl.textContent = totalNet >= 0 
            ? `+$${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
            : `-$${Math.abs(totalNet).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          netPnlEl.className = `net-pnl ${totalNet >= 0 ? 'green' : 'red'}`;
        }
      }

      if (labelFollowed) {
        labelFollowed.textContent = `+$${totalFollowed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }

      if (labelBroken) {
        labelBroken.textContent = `-$${Math.abs(totalBroken).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
        } else if (includeSample && customTrades.length === 0) {
          hudWr.textContent = '+76.2% WR';
          hudWr.className = 'pillar-val gold';
          if (hudWrSub) hudWrSub.textContent = 'Sample Benchmark';
          if (hudDiscipline) hudDiscipline.textContent = 'STRICT GATES';
          if (hudDisciplineSub) hudDisciplineSub.textContent = 'Rules = Profit';
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

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = localStorage.getItem('dma_include_sample_data') !== 'false';
        localStorage.setItem('dma_include_sample_data', (!current) ? 'true' : 'false');
        updateDashboardMetrics();
        if (typeof window.renderDashboardPlaybooks === 'function') {
          window.renderDashboardPlaybooks();
        }
      });
    }

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

    // 1. Render custom trades from localStorage
    try {
      const customTrades = JSON.parse(localStorage.getItem('dma_trades') || '[]');
      if (customTrades.length > 0) {
        const todayHeader = journalList.querySelector('.date-group-header');
        customTrades.forEach(t => {
          const card = document.createElement('div');
          const isWin = Number(t.pnl) >= 0;
          const pnlNum = Number(t.pnl) || 0;
          const pnlFormatted = isWin 
            ? `+$${pnlNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
            : `-$${Math.abs(pnlNum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          const rMult = t.rMultiple || (isWin ? '+2.2R' : '-1.0R');
          const strategyTitle = t.strategy || (t.strategyKey === 'trend' ? 'Trend Continuation' : (t.strategyKey === 'impulse' ? 'Impulse Entry' : 'A+ Reversal'));

          card.className = `trade-card ${t.isCompliant ? 'followed' : 'broken'}`;
          card.setAttribute('data-trade-id', t.id || Date.now());
          card.setAttribute('data-asset', t.asset || 'XAUUSD');
          card.setAttribute('data-direction', (t.direction || 'long').toLowerCase());
          card.setAttribute('data-setup', t.strategyKey || 'reversal');
          card.setAttribute('data-date', 'today');
          card.setAttribute('data-time', t.date || 'Today');
          card.setAttribute('data-timestamp', t.timestamp || Date.now());
          card.setAttribute('data-pnl', pnlNum);
          card.setAttribute('data-rmult', rMult);
          card.setAttribute('data-compliance', t.isCompliant ? 'true' : 'false');
          card.setAttribute('data-confluences-met', t.confluencesMet || (t.isCompliant ? 4 : 1));
          card.setAttribute('data-confluences-total', t.totalConfluences || 4);
          
          const tags = t.isCompliant 
            ? ['Rules Followed', 'Disciplined', 'Playbook'] 
            : ['Rules Broken', t.breachReason || 'FOMO', 'Impulse'];
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

          card.innerHTML = `
            <div class="trade-header">
              <div class="trade-asset">
                <span class="direction ${(t.direction || 'long').toLowerCase()}">${(t.direction || 'long').toUpperCase()}</span>
                <span class="ticker">${t.asset || 'XAUUSD'}</span>
              </div>
              <div class="trade-pnl ${isWin ? 'win' : 'loss'}">${pnlFormatted}</div>
            </div>
            <div class="trade-meta">
              <span class="time">${t.date || 'Today'}</span>
              <span class="setup-name">${strategyTitle}</span>
            </div>
            <div class="trade-tags">
              ${tagBadgesHtml}
            </div>
            <div class="trade-footer">
              <span class="discipline-badge ${t.isCompliant ? 'green' : 'red'}">
                ${t.isCompliant ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Rules Followed' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Rules Broken'}
              </span>
              <span class="confluences">${t.confluencesMet || (t.isCompliant ? 4 : 1)}/${t.totalConfluences || 4} Confluences</span>
            </div>
            ${screenshotActionHtml}
          `;

          if (todayHeader && todayHeader.nextSibling) {
            todayHeader.parentNode.insertBefore(card, todayHeader.nextSibling);
          } else {
            journalList.prepend(card);
          }
        });
      }
    } catch (err) {
      console.warn('Could not load custom trades into journal', err);
    }

    // Attach saved debrief badges to all trade cards (demo + custom)
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

    // 2. Filter State
    let activeTab = 'all'; // 'all' | 'followed' | 'broken'
    let activeDateFilter = 'all'; // 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'
    let activeCalFilteredDate = null; // YYYY-MM-DD when clicked in calendar

    // Sample Data Toggle Controls
    const toggleSampleBtn = document.getElementById('toggle-sample-data-btn');
    const sampleStatusPill = document.getElementById('sample-status-pill');
    const sampleStatusText = document.getElementById('sample-status-text');

    function syncSampleDataUI() {
      const includeSample = localStorage.getItem('dma_include_sample_data') !== 'false';
      if (sampleStatusPill) {
        sampleStatusPill.classList.toggle('hidden-mode', !includeSample);
      }
      if (sampleStatusText) {
        sampleStatusText.textContent = includeSample ? 'Sample Trades: Active' : 'Sample Trades: Hidden';
      }
      if (toggleSampleBtn) {
        toggleSampleBtn.textContent = includeSample ? 'Hide Sample Data' : 'Show Sample Data';
      }
    }

    if (toggleSampleBtn) {
      syncSampleDataUI();
      toggleSampleBtn.addEventListener('click', () => {
        const current = localStorage.getItem('dma_include_sample_data') !== 'false';
        localStorage.setItem('dma_include_sample_data', (!current) ? 'true' : 'false');
        syncSampleDataUI();
        applyAllJournalFilters();
        renderCalendarHeatmap();
      });
    }
    let searchQuery = '';
    let advFilters = {
      asset: 'all',
      direction: 'all',
      setup: 'all',
      date: 'all',
      customFrom: null,
      customTo: null
    };

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
        let matchCalDate = true;
        if (activeCalFilteredDate) {
          matchCalDate = getTradeDateKey(card) === activeCalFilteredDate;
        }

        const includeSample = localStorage.getItem('dma_include_sample_data') !== 'false';
        const tradeId = card.getAttribute('data-trade-id') || '';
        let matchSample = true;
        if (!includeSample && tradeId.startsWith('demo-')) {
          matchSample = false;
        }

        const isVisible = matchTab && matchSearch && matchDateFilter && matchAdv && matchCalDate && matchSample;

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
      const disciplineEl = document.getElementById('journal-discipline-rate');
      const fomoTaxEl = document.getElementById('journal-fomo-tax');

      if (netPnlEl) {
        if (visibleCount === 0) {
          netPnlEl.textContent = '$0.00';
          netPnlEl.className = 'digest-val';
        } else {
          netPnlEl.textContent = (netPnl >= 0 
            ? `+$${netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
            : `-$${Math.abs(netPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
          netPnlEl.className = `digest-val ${netPnl >= 0 ? 'green' : 'red'}`;
        }
      }

      if (tradesCountEl) {
        tradesCountEl.textContent = visibleCount === 0 ? '0 Trades' : `${visibleCount} Trades (${winCount}W · ${lossCount}L)`;
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
          ? `-$${fomoTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
          : '$0.00';
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
          const formattedNet = groupNet >= 0 
            ? `+$${groupNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
            : `-$${Math.abs(groupNet).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
          const isSampleHidden = localStorage.getItem('dma_include_sample_data') === 'false';
          emptyState.innerHTML = `
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--ink-muted); margin-bottom: 0.75rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h4>${isSampleHidden ? 'No Live Trades Logged' : 'No Trades Found'}</h4>
            <p>${isSampleHidden ? 'Sample demo trades are currently hidden. Log your trades in the Trade Terminal, or enable sample data to view benchmark models.' : 'No logged trades match the selected date, tab, or search criteria.'}</p>
            <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 0.5rem; flex-wrap: wrap;">
              ${isSampleHidden ? '<button type="button" class="btn btn-primary" id="empty-show-sample-btn" style="padding: 0.45rem 0.9rem; font-size: 0.78rem;">Show Sample Data</button>' : ''}
              <button type="button" class="btn btn-ghost" id="empty-reset-filters-btn" style="padding: 0.45rem 0.9rem; font-size: 0.78rem;">Reset All Filters</button>
            </div>
          `;
          journalList.appendChild(emptyState);
          document.getElementById('empty-reset-filters-btn')?.addEventListener('click', resetAllFilters);
          document.getElementById('empty-show-sample-btn')?.addEventListener('click', () => {
            localStorage.setItem('dma_include_sample_data', 'true');
            if (typeof syncSampleDataUI === 'function') syncSampleDataUI();
            applyAllJournalFilters();
            renderCalendarHeatmap();
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
      advFilters = { asset: 'all', direction: 'all', setup: 'all', date: 'all', customFrom: null, customTo: null };

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
        pnlValEl.textContent = (isWin 
          ? `+$${pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
          : `-$${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        pnlValEl.className = `inspector-pnl-val ${isWin ? 'green' : 'red'}`;
      }

      if (rmultValEl) rmultValEl.textContent = `${rmult} Realized`;

      if (compBadgeEl) {
        compBadgeEl.className = `inspector-compliance-badge ${isCompliant ? 'green' : 'red'}`;
        compBadgeEl.innerHTML = isCompliant
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"></polyline></svg> 100% Rules Followed'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Rules Broken';
      }

      if (setupNameEl) setupNameEl.textContent = setupName;
      if (timeStampEl) timeStampEl.textContent = timeText;

      if (tagsContainerEl) {
        tagsContainerEl.innerHTML = tags.map(tag => `<span class="psych-tag ${isCompliant ? 'good' : 'bad'}">${tag}</span>`).join(' ');
      }

      const metCount = card.getAttribute('data-confluences-met') || (isCompliant ? confluences.length : 1);
      const totalCount = card.getAttribute('data-confluences-total') || confluences.length;
      if (gatesCountEl) gatesCountEl.textContent = `${metCount}/${totalCount}`;

      if (gatesListEl) {
        gatesListEl.innerHTML = confluences.map((c, i) => {
          const isMet = isCompliant || i === 0;
          return `
            <div class="inspector-gate-item">
              <span class="gate-status-icon ${isMet ? 'met' : 'broken'}">${isMet ? '✓' : '✕'}</span>
              <span>${c}</span>
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
      deleteTradeBtn.addEventListener('click', () => {
        if (!currentInspectedCard) return;
        const confirmed = confirm('Are you sure you want to delete this trade from your journal? This will update your net P&L and metrics.');
        if (!confirmed) return;

        const tradeId = currentInspectedTradeId;
        try {
          const stored = JSON.parse(localStorage.getItem('dma_trades') || '[]');
          const updated = stored.filter(t => String(t.id) !== String(tradeId));
          localStorage.setItem('dma_trades', JSON.stringify(updated));
        } catch (err) {
          console.warn('Could not remove trade from storage', err);
        }

        // Delete from Cloud Firestore backend
        if (window.DMA_DB && typeof window.DMA_DB.deleteTrade === 'function') {
          window.DMA_DB.deleteTrade(tradeId);
        }

        currentInspectedCard.remove();
        closeTradeInspector();
        applyAllJournalFilters();
      });
    }

    // CSV Export Engine
    const exportCsvBtn = document.getElementById('export-csv-btn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        const cards = journalList.querySelectorAll('.trade-card');
        if (cards.length === 0) {
          alert('No trades available in the journal to export.');
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

      const includeSample = localStorage.getItem('dma_include_sample_data') !== 'false';
      allCards.forEach(card => {
        const tid = card.getAttribute('data-trade-id') || '';
        if (!includeSample && tid.startsWith('demo-')) return;

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
        const fNet = monthTotalNet >= 0 
          ? `+$${monthTotalNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
          : `-$${Math.abs(monthTotalNet).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        monthNetEl.innerHTML = `Month Net: <b style="color: ${monthTotalNet >= 0 ? 'var(--success)' : 'var(--danger)'};">${fNet}</b>`;
      }
      if (monthDiscEl) {
        const discRate = monthTradeCount > 0 ? Math.round((monthCompliantCount / monthTradeCount) * 100) : 100;
        monthDiscEl.innerHTML = `Discipline: <b style="color: ${discRate >= 80 ? 'var(--success)' : (discRate >= 50 ? 'var(--cyan)' : 'var(--danger)')};">${discRate}%</b>`;
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

    // Initial pass
    applyAllJournalFilters();
    renderCalendarHeatmap();
  }

  // Ensure init runs
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initJournalModule);
  } else {
    initJournalModule();
  }


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

    const includeSample = localStorage.getItem('dma_include_sample_data') !== 'false';
    const rawB = basePeriods[period] || basePeriods.this_month;
    const b = JSON.parse(JSON.stringify(rawB));

    if (!includeSample) {
      b.baseTotal = 0;
      b.baseCompliant = 0;
      b.baseActual = 0;
      b.baseFollowed = 0;
      b.m1.count = 0; b.m1.cost = 0;
      b.m2.count = 0; b.m2.cost = 0;
      b.m3.count = 0; b.m3.cost = 0;
      b.weeks.forEach(w => { w.actual = 0; w.ideal = 0; });
    }

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

    const fmt = (num) => num >= 0 ? `+$${Math.round(num).toLocaleString('en-US')}` : `-$${Math.round(Math.abs(num)).toLocaleString('en-US')}`;

    const finalWk = b.weeks[b.weeks.length - 1];
    finalWk.actual = netActual;
    finalWk.ideal = netFollowed;

    const weeksFormatted = b.weeks.map(w => {
      const g = w.actual - w.ideal;
      return {
        label: w.label,
        actual: fmt(w.actual),
        ideal: fmt(w.ideal),
        gap: g >= 0 ? fmt(g) : `-$${Math.round(Math.abs(g)).toLocaleString('en-US')}`,
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
      actual: totalTrades > 0 ? fmt(netActual) : '$0.00',
      followed: totalTrades > 0 ? fmt(netFollowed) : '$0.00',
      fomoTax: totalTrades > 0 ? `$${Math.round(netFomoTax).toLocaleString('en-US')}` : '$0.00',
      weeks: weeksFormatted,
      xLabels: b.xLabels,
      polyActual: actualPoints,
      polyIdeal: idealPoints,
      m1: {
        count: `${b.m1.count} Occurrences`,
        leak: `-$${Math.round(Math.abs(b.m1.cost) / (b.m1.count || 1))} / breach`,
        cost: fmt(b.m1.cost)
      },
      m2: {
        count: `${b.m2.count} Occurrences`,
        leak: `-$${Math.round(Math.abs(b.m2.cost) / (b.m2.count || 1))} / breach`,
        cost: fmt(b.m2.cost)
      },
      m3: {
        count: `${b.m3.count} Occurrences`,
        leak: `-$${Math.round(Math.abs(b.m3.cost) / (b.m3.count || 1))} / breach`,
        cost: fmt(b.m3.cost)
      },
      edges: b.edges.map(e => ({
        name: e.name,
        bar: !includeSample && totalTrades === 0 ? '0%' : `${e.val}%`,
        val: !includeSample && totalTrades === 0 ? '0%' : `${e.val}%`
      }))
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

      const seedTrades = [
        { id: 'demo-1', date: 'Today · 09:32 AM', asset: 'XAUUSD', direction: 'LONG', setup: 'A+ Setup Reversal', pnl: 1240, rMultiple: '+2.5R', isCompliant: true, confluencesMet: 4, totalConfluences: 4, breachReason: '', notes: 'Disciplined execution at London open.' },
        { id: 'demo-2', date: 'Today · 14:15 PM', asset: 'NQ1!', direction: 'SHORT', setup: 'Impulse Entry (FOMO)', pnl: -450, rMultiple: '-1.0R', isCompliant: false, confluencesMet: 1, totalConfluences: 4, breachReason: 'Impulse Entry (FOMO)', notes: 'FOMO caught me during news volatility.' },
        { id: 'demo-3', date: 'Yesterday · 08:10 AM', asset: 'EURUSD', direction: 'LONG', setup: 'Trend Continuation', pnl: -210, rMultiple: '-1.0R', isCompliant: true, confluencesMet: 3, totalConfluences: 3, breachReason: '', notes: 'Good setup, fully compliant execution.' }
      ];

      const all = [...customTrades, ...seedTrades];
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

  function syncAnalyticsBanner() {
    const banner = document.getElementById('dashboard-sample-banner');
    if (!banner) return;
    const includeSample = localStorage.getItem('dma_include_sample_data') !== 'false';
    const pillText = document.getElementById('dashboard-sample-pill-text');
    const hint = document.getElementById('dashboard-sample-hint');
    const toggleBtn = document.getElementById('dashboard-toggle-sample-btn');

    banner.classList.toggle('demo-active', includeSample);
    if (pillText) {
      pillText.textContent = includeSample ? 'Demo Mode: Sample Trades Visible' : 'Live Ledger: Real Trades Only';
    }
    if (hint) {
      hint.textContent = includeSample 
        ? 'Viewing preloaded benchmark data alongside your trades.' 
        : 'Clean account ($0.00). Toggle sample data to explore benchmark analytics.';
    }
    if (toggleBtn) {
      const toggleText = toggleBtn.querySelector('span') || toggleBtn;
      toggleText.textContent = includeSample ? 'Switch to Clean ($0.00)' : 'Enable Sample Data';
    }
  }

  const anToggleBtn = document.getElementById('dashboard-toggle-sample-btn');
  if (anToggleBtn && document.getElementById('discipline-score-num')) {
    anToggleBtn.addEventListener('click', () => {
      const current = localStorage.getItem('dma_include_sample_data') !== 'false';
      localStorage.setItem('dma_include_sample_data', (!current) ? 'true' : 'false');
      syncAnalyticsBanner();
      renderAnalytics(currentPeriod);
    });
  }

  // Initial call on analytics page if present
  if (document.getElementById('discipline-score-num')) {
    syncAnalyticsBanner();
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
}

function closeLogTradeModal() {
  const modal = document.getElementById('log-trade-modal');
  const backdrop = document.getElementById('log-trade-backdrop');
  if (!modal || !backdrop) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
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

  return isFullCompliance;
}

// Modal event listeners setup
const closeLogTradeBtn = document.getElementById('close-log-trade-btn');
const logTradeBackdrop = document.getElementById('log-trade-backdrop');
if (closeLogTradeBtn) closeLogTradeBtn.addEventListener('click', closeLogTradeModal);
if (logTradeBackdrop) logTradeBackdrop.addEventListener('click', closeLogTradeModal);

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
const pnlSignBtns = document.querySelectorAll('#pnl-sign-toggle .sign-btn');
pnlSignBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pnlSignBtns.forEach(b => {
      b.classList.remove('active');
      b.classList.remove('pos');
      b.classList.remove('neg');
    });
    btn.classList.add('active');
    activePnlSign = btn.getAttribute('data-sign') || '+';
    if (activePnlSign === '+') {
      btn.classList.add('pos');
    } else {
      btn.classList.add('neg');
    }
  });
});

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

    const pnlRaw = Math.abs(parseFloat(document.getElementById('trade-pnl-input')?.value) || 0);
    const pnlFinal = activePnlSign === '-' ? -pnlRaw : pnlRaw;
    const rMultiple = pnlFinal >= 0 ? '+2.2R' : '-1.0R';

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
      rMultiple,
      confluencesMet: met,
      totalConfluences: total,
      confluences: confluencesList,
      isCompliant,
      breachReason,
      screenshotUrl,
      notes: isCompliant ? 'Executed with 100% adherence to playbook confluences.' : `Rule breach detected: ${breachReason || 'Confluences missed'}`,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

    closeLogTradeModal();

    // Feedback Alert
    if (isCompliant) {
      alert(`✓ TRADE COMMITTED TO LEDGER!\n\n${asset} ${direction} (${pnlFinal >= 0 ? '+$' + pnlFinal : '-$' + Math.abs(pnlFinal)})\n100% Plan Compliance (${met}/${total} Confluences Verified).\n\nDiscipline maintained.`);
    } else {
      alert(`⚠ TRADE COMMITTED UNDER RULES BROKEN\n\n${asset} ${direction} (${pnlFinal >= 0 ? '+$' + pnlFinal : '-$' + Math.abs(pnlFinal)})\nMissing: ${total - met} of ${total} confluences.\n\nAdded to your FOMO Tax calculation.`);
    }
  });
}

// Local storage trade rendering & journal interactions are managed by initJournalModule()


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
 * Returns effective playbooks respecting the sample data setting
 */
function getEffectivePlaybooks() {
  const includeSample = localStorage.getItem('dma_include_sample_data') !== 'false';
  const deletedIds = JSON.parse(localStorage.getItem('dma_deleted_playbooks') || '[]');
  const customSaved = JSON.parse(localStorage.getItem('dma_custom_playbooks') || '[]');

  const list = [];

  // 1. Include sample benchmark playbooks ONLY when enabled
  if (includeSample) {
    Object.values(benchmarkPlaybooks).forEach(bm => {
      if (!deletedIds.includes(bm.id)) {
        list.push(bm);
        playbookRegistry[bm.id] = bm;
        tradeStrategies[bm.id] = {
          name: bm.name,
          confluences: bm.confluences
        };
      }
    });
  }

  // 2. Include user custom playbooks
  customSaved.forEach(cp => {
    if (!deletedIds.includes(cp.id) && !list.some(item => item.id === cp.id)) {
      list.push(cp);
      playbookRegistry[cp.id] = cp;
      tradeStrategies[cp.id] = {
        name: cp.name,
        confluences: cp.confluences
      };
    }
  });

  return list;
}

/**
 * Renders playbooks on app.html dashboard
 */
function renderDashboardPlaybooks() {
  const container = document.getElementById('playbook-cards-list');
  if (!container) return;

  const playbooks = getEffectivePlaybooks();
  container.innerHTML = '';

  if (playbooks.length === 0) {
    const emptyBox = document.createElement('div');
    emptyBox.className = 'empty-playbook-box';
    emptyBox.innerHTML = `
      <div class="empty-pb-icon">📋</div>
      <h4 class="empty-pb-title">No Active Playbooks</h4>
      <p class="empty-pb-desc">New account initialized. Build your custom setup with mandatory rules, or turn on sample data to explore prebuilt models.</p>
      <div class="empty-pb-actions">
        <button type="button" class="btn btn-primary btn-sm" id="empty-create-pb-btn">+ Create Setup</button>
        <button type="button" class="btn btn-ghost btn-sm" id="empty-load-sample-pb-btn">Enable Sample Data</button>
      </div>
    `;
    container.appendChild(emptyBox);

    const createBtn = emptyBox.querySelector('#empty-create-pb-btn');
    if (createBtn) createBtn.addEventListener('click', openChecklistCreatorModal);

    const sampleBtn = emptyBox.querySelector('#empty-load-sample-pb-btn');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => {
        localStorage.setItem('dma_include_sample_data', 'true');
        if (typeof window.updateDashboardMetrics === 'function') window.updateDashboardMetrics();
        renderDashboardPlaybooks();
      });
    }
    return;
  }

  playbooks.forEach(pb => {
    const card = document.createElement('div');
    card.className = 'checklist-card';
    card.setAttribute('data-playbook-id', pb.id);
    card.innerHTML = `
      <div class="card-info">
        <h4>${pb.name}</h4>
        <span class="card-meta">${pb.confluences ? pb.confluences.length : 3} Confluences • ${pb.wr || '--% WR'}</span>
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

  const pb = playbookRegistry[playbookId];
  if (!pb) return;

  activeInspectingPlaybookId = playbookId;

  // Header & Title
  const title = document.getElementById('pb-detail-title');
  const wrBadge = document.getElementById('pb-detail-wr');
  if (title) title.textContent = pb.name;
  if (wrBadge) wrBadge.textContent = `${pb.wr || '68%'} WR`;

  // Visual Divergence Bars & Multipliers
  const statFollowed = document.getElementById('pb-detail-stat-followed');
  const barFollowed = document.getElementById('pb-bar-followed');
  const metaFollowed = document.getElementById('pb-followed-trades-meta');

  const statBroken = document.getElementById('pb-detail-stat-broken');
  const barBroken = document.getElementById('pb-bar-broken');
  const metaBroken = document.getElementById('pb-broken-trades-meta');

  const multiplierVal = document.getElementById('pb-multiplier-val');

  if (statFollowed) statFollowed.textContent = `${pb.followedWR || '75%'} WR`;
  if (barFollowed) barFollowed.style.width = pb.followedBar || pb.followedWR || '75%';
  if (metaFollowed) metaFollowed.textContent = pb.followedMeta || 'Strict Discipline Wins';

  if (statBroken) statBroken.textContent = `${pb.brokenWR || '20%'} WR`;
  if (barBroken) barBroken.style.width = pb.brokenBar || pb.brokenWR || '20%';
  if (metaBroken) metaBroken.textContent = pb.brokenMeta || 'FOMO / Emotional Losses';

  if (multiplierVal) multiplierVal.textContent = pb.multiplier || '3.5x Higher Win Rate';

  // Sparkline Equity & P&L
  const statPnl = document.getElementById('pb-detail-stat-pnl');
  const potentialPnl = document.getElementById('pb-potential-pnl');
  const actualPnl = document.getElementById('pb-actual-pnl');
  const svgFollowed = document.getElementById('pb-svg-followed');
  const svgActual = document.getElementById('pb-svg-actual');

  if (statPnl) statPnl.textContent = `${pb.pnl || '+$1,500'} Net`;
  if (potentialPnl) potentialPnl.textContent = pb.potentialPnl || '+$2,400';
  if (actualPnl) actualPnl.textContent = pb.actualPnl || pb.pnl || '+$1,500';

  if (svgFollowed && pb.svgFollowed) svgFollowed.setAttribute('points', pb.svgFollowed);
  if (svgActual && pb.svgActual) svgActual.setAttribute('points', pb.svgActual);

  // Required Confluences List
  const confCount = document.getElementById('pb-detail-conf-count');
  const rulesList = document.getElementById('pb-detail-rules-list');
  if (confCount) confCount.textContent = `${pb.confluences.length} Required`;

  if (rulesList) {
    rulesList.innerHTML = '';
    pb.confluences.forEach((rule, idx) => {
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

    // Select this strategy in Log Trade Modal
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

// Delete Playbook action
const pbDeleteBtn = document.getElementById('pb-delete-btn');
if (pbDeleteBtn) {
  pbDeleteBtn.addEventListener('click', () => {
    if (!activeInspectingPlaybookId) return;

    const targetId = activeInspectingPlaybookId;
    const pb = playbookRegistry[targetId];
    const pbName = pb ? pb.name : 'this playbook';

    if (!confirm(`Delete "${pbName}"?\n\nThis will remove the setup and its checklist rules from your active playbooks.`)) {
      return;
    }

    // 1. Remove Card from Dashboard & Playbook Grid
    const card = document.querySelector(`.checklist-card[data-playbook-id="${targetId}"]`);
    if (card) card.remove();
    const pbCard = document.querySelector(`.playbook-card[data-playbook-id="${targetId}"]`);
    if (pbCard) pbCard.remove();
    if (typeof window.refreshPlaybookGrid === 'function') {
      window.refreshPlaybookGrid();
    }


    // 2. Remove from Log Strategy Dropdown & Pills
    const opt = document.querySelector(`#log-strategy-select option[value="${targetId}"]`);
    if (opt) opt.remove();

    const pill = document.querySelector(`#log-strategy-group .strategy-pill[data-strategy="${targetId}"]`);
    if (pill) pill.remove();

    // 3. Remove from in-memory objects
    delete playbookRegistry[targetId];
    delete tradeStrategies[targetId];

    // 4. Update localStorage
    try {
      // Remove from custom playbooks if present
      const customSaved = JSON.parse(localStorage.getItem('dma_custom_playbooks') || '[]');
      const filtered = customSaved.filter(item => item.id !== targetId);
      localStorage.setItem('dma_custom_playbooks', JSON.stringify(filtered));

      // Persist deletion for built-in playbooks too
      const deletedIds = JSON.parse(localStorage.getItem('dma_deleted_playbooks') || '[]');
      if (!deletedIds.includes(targetId)) {
        deletedIds.push(targetId);
        localStorage.setItem('dma_deleted_playbooks', JSON.stringify(deletedIds));
      }
      // Delete from Cloud Firestore backend
      if (window.DMA_DB && typeof window.DMA_DB.deletePlaybook === 'function') {
        window.DMA_DB.deletePlaybook(targetId);
      }
      if (typeof window.renderDashboardPlaybooks === 'function') {
        window.renderDashboardPlaybooks();
      }
    } catch (err) {
      console.warn('Storage error during playbook delete:', err);
    }

    // 5. Close inspector modal
    closePlaybookDetailModal();
  });
}

const closePlaybookDetailBtn = document.getElementById('close-playbook-detail-btn');
const playbookDetailBackdrop = document.getElementById('playbook-detail-backdrop');
if (closePlaybookDetailBtn) closePlaybookDetailBtn.addEventListener('click', closePlaybookDetailModal);
if (playbookDetailBackdrop) playbookDetailBackdrop.addEventListener('click', closePlaybookDetailModal);

// ==========================================================================
// CHECKLIST CREATOR MODAL
// ==========================================================================
function openChecklistCreatorModal() {
  const modal = document.getElementById('checklist-creator-modal');
  const backdrop = document.getElementById('checklist-creator-backdrop');
  if (!modal || !backdrop) return;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeChecklistCreatorModal() {
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
if (headerAddChecklistBtn) headerAddChecklistBtn.addEventListener('click', openChecklistCreatorModal);

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
    <input type="text" class="rule-input" value="${initialValue}" placeholder="${placeholder}" required>
    <button type="button" class="rule-remove-btn" aria-label="Remove">✕</button>
  `;

  row.querySelector('.rule-remove-btn').addEventListener('click', () => {
    const allRows = creatorRulesContainer.querySelectorAll('.creator-rule-row');
    if (allRows.length > 1) {
      row.remove();
      updateRuleNumbers();
    } else {
      alert('A playbook must have at least one confluence rule.');
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
        alert('A playbook must have at least one confluence rule.');
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

// Category pills in Creator
const creatorTypePills = document.querySelectorAll('#creator-type-pills .pill');
creatorTypePills.forEach(pill => {
  pill.addEventListener('click', () => {
    creatorTypePills.forEach(p => p.classList.remove('active'));
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

// Checklist Creator Form Submission
const checklistCreatorForm = document.getElementById('checklist-creator-form');
if (checklistCreatorForm) {
  checklistCreatorForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('creator-setup-name')?.value.trim();
    if (!name) return;

    const setupType = document.querySelector('#creator-type-pills .pill.active')?.getAttribute('data-type') || 'reversal';
    const targetRr = document.querySelector('#creator-rr-pills .pill.active')?.getAttribute('data-rr') || '1:2.5';

    // Collect rules
    const ruleInputs = creatorRulesContainer.querySelectorAll('.rule-input');
    const confluences = [];
    ruleInputs.forEach(inp => {
      const val = inp.value.trim();
      if (val) confluences.push(val);
    });

    if (confluences.length === 0) {
      alert('Please add at least one confluence rule.');
      return;
    }

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
      window.DMA_DB.savePlaybook(newPlaybook).catch(err => {
        console.warn('[DMA Backend] Firestore savePlaybook error:', err);
      });
    }

    // Live update on Dashboard
    renderDashboardPlaybooks();

    // Also update Log Strategy Select
    const logStrategySelect = document.getElementById('log-strategy-select');
    if (logStrategySelect) {
      const opt = document.createElement('option');
      opt.value = newId;
      opt.textContent = name;
      logStrategySelect.appendChild(opt);
      logStrategySelect.value = newId;
    }

    closeChecklistCreatorModal();
    if (typeof window.refreshPlaybookGrid === 'function') {
      window.refreshPlaybookGrid();
    }
    alert(`✓ NEW PLAYBOOK SAVED!\n\n"${name}" is now live in Your Playbook and selectable in the trade logger.`);
  });
}

// Load custom playbooks and prune deleted playbooks on startup
function loadSavedPlaybooks() {
  try {
    // 1. Prune any built-in playbooks that were marked deleted
    const deletedIds = JSON.parse(localStorage.getItem('dma_deleted_playbooks') || '[]');
    deletedIds.forEach(delId => {
      delete playbookRegistry[delId];
      delete tradeStrategies[delId];
    });

    // 2. Render playbooks container on Dashboard
    renderDashboardPlaybooks();

    // 3. Populate strategy choices in logger
    const logStrategySelect = document.getElementById('log-strategy-select');
    if (logStrategySelect) {
      const effective = getEffectivePlaybooks();
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
    }
  } catch (err) {
    console.warn('Could not load playbooks', err);
  }
}

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

  function getActivePlaybooks() {
    return getEffectivePlaybooks();
  }

  function syncPlaybookBanner() {
    const banner = document.getElementById('dashboard-sample-banner');
    if (!banner) return;
    const includeSample = localStorage.getItem('dma_include_sample_data') !== 'false';
    const pillText = document.getElementById('dashboard-sample-pill-text');
    const hint = document.getElementById('dashboard-sample-hint');
    const toggleBtn = document.getElementById('dashboard-toggle-sample-btn');

    banner.classList.toggle('demo-active', includeSample);
    if (pillText) {
      pillText.textContent = includeSample ? 'Demo Mode: Sample Models Visible' : 'Live Ledger: Real Setups Only';
    }
    if (hint) {
      hint.textContent = includeSample 
        ? 'Viewing prebuilt benchmark models alongside your custom playbooks.' 
        : 'Clean account. Toggle sample data to explore benchmark trading models.';
    }
    if (toggleBtn) {
      const toggleText = toggleBtn.querySelector('span') || toggleBtn;
      toggleText.textContent = includeSample ? 'Switch to Clean Ledger ($0.00)' : 'Enable Sample Data';
    }
  }

  const pbToggleBtn = document.getElementById('dashboard-toggle-sample-btn');
  if (pbToggleBtn) {
    pbToggleBtn.addEventListener('click', () => {
      const current = localStorage.getItem('dma_include_sample_data') !== 'false';
      localStorage.setItem('dma_include_sample_data', (!current) ? 'true' : 'false');
      syncPlaybookBanner();
      renderGrid();
    });
  }

  function renderGrid() {
    const playbooks = getActivePlaybooks();
    const q = searchQuery.toLowerCase().trim();

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
        <p class="empty-pb-desc">You haven't defined any systematic trading playbooks yet. Add your proprietary strategy or enable sample benchmark data.</p>
        <div class="empty-pb-actions">
          <button type="button" class="btn btn-primary btn-sm" id="pb-empty-create-btn">+ Build New Playbook</button>
          <button type="button" class="btn btn-ghost btn-sm" id="pb-empty-sample-btn">Load Demo Benchmark Setups</button>
        </div>
      `;
      grid.appendChild(emptyBox);

      const createBtn = emptyBox.querySelector('#pb-empty-create-btn');
      if (createBtn) createBtn.addEventListener('click', openChecklistCreatorModal);
      const sampleBtn = emptyBox.querySelector('#pb-empty-sample-btn');
      if (sampleBtn) {
        sampleBtn.addEventListener('click', () => {
          localStorage.setItem('dma_include_sample_data', 'true');
          syncPlaybookBanner();
          renderGrid();
        });
      }

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
        kpiPnl.className = 'digest-val green';
      }
      return;
    }

    playbooks.forEach(pb => {
      const type = (pb.setupType || 'reversal').toLowerCase();
      const wrNum = parseFloat(pb.wr) || 0;
      const name = pb.name || 'Setup Model';
      const thesis = pb.thesis || '';
      const confluences = pb.confluences || [];
      const confluencesStr = confluences.join(' ').toLowerCase();

      // Filter by category
      let matchCat = true;
      if (activeFilter === 'top') matchCat = wrNum >= 65;
      else if (activeFilter !== 'all') matchCat = type === activeFilter;

      // Filter by search
      let matchSearch = true;
      if (q) {
        const combined = `${name.toLowerCase()} ${type} ${thesis.toLowerCase()} ${confluencesStr}`;
        matchSearch = combined.includes(q);
      }

      if (!matchCat || !matchSearch) return;

      visibleCount++;
      totalWrSum += wrNum;

      let pnlClean = 0;
      if (pb.pnlNum !== undefined) {
        pnlClean = pb.pnlNum;
      } else {
        const pnlStr = (pb.pnl || '0').replace(/[^0-9.-]+/g, '');
        pnlClean = parseFloat(pnlStr) || 0;
      }
      totalPnlSum += pnlClean;

      const card = document.createElement('div');
      card.className = 'playbook-card';
      card.setAttribute('data-playbook-id', pb.id);
      card.setAttribute('data-type', type);
      card.setAttribute('data-wr', wrNum);
      card.setAttribute('data-name', name);

      const followedWR = pb.followedWR || `${wrNum}%`;
      const brokenWR = pb.brokenWR || '20.0%';
      const followedValNum = parseFloat(followedWR) || 75;
      const targetRr = pb.targetRr || '1:2.5+';
      const timeframe = pb.timeframe || (type === 'reversal' ? 'M15 / H4' : (type === 'trend' ? 'H1 / D1' : 'M5 / M15'));

      const rulesHtml = confluences.map(c => `
        <div class="pb-card-rule-item">
          <span class="pb-rule-dot"></span>
          <span>${c}</span>
        </div>
      `).join('');

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
            <span class="pb-mini-stat-val ${wrNum >= 60 ? 'green' : 'cyan'}">${pb.wr || wrNum + '%'}</span>
          </div>
          <div class="pb-mini-stat">
            <span class="pb-mini-stat-label">TRADES</span>
            <span class="pb-mini-stat-val">${pb.tradesCount || confluences.length * 8} Ex</span>
          </div>
          <div class="pb-mini-stat">
            <span class="pb-mini-stat-label">TOTAL P&L</span>
            <span class="pb-mini-stat-val green">${pb.pnl || '+$1,500'}</span>
          </div>
        </div>

        <div class="pb-card-divergence">
          <div class="pb-divergence-bar-wrap">
            <div class="fill-good" style="width: ${followedValNum}%;"></div>
            <div class="fill-bad" style="width: ${100 - followedValNum}%;"></div>
          </div>
          <div class="pb-divergence-text-row">
            <span class="good">✓ Followed: ${followedWR} WR</span>
            <span class="bad">⚠ Broken: ${brokenWR} WR</span>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span>INSPECT EDGE</span>
          </button>
          <button type="button" class="btn-trade-pb" data-action="trade-pb" data-id="${pb.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <span>TRADE MODEL</span>
          </button>
        </div>
      `;

      card.querySelector('[data-action="inspect-pb"]').addEventListener('click', (e) => {
        e.stopPropagation();
        openPlaybookDetailModal(pb.id);
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
      const avgWr = visibleCount > 0 ? (totalWrSum / visibleCount).toFixed(1) : '0.0';
      kpiWr.textContent = `${avgWr}%`;
    }
    if (kpiEdge) {
      kpiEdge.textContent = visibleCount > 0 ? '+3.5x Edge' : '0x Edge';
    }
    if (kpiPnl) {
      kpiPnl.textContent = totalPnlSum >= 0 ? `+$${totalPnlSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-$${Math.abs(totalPnlSum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      kpiPnl.className = `digest-val ${totalPnlSum >= 0 ? 'green' : 'red'}`;
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
  syncPlaybookBanner();
  renderGrid();

  window.refreshPlaybookGrid = renderGrid;
}

// Global Cloud Firestore Sync Listener
window.addEventListener('dma-data-synced', () => {
  console.log('[DMA Backend] Cloud Firestore sync event received');
  if (typeof window.updateDashboardMetrics === 'function') window.updateDashboardMetrics();
  if (typeof window.renderDashboardPlaybooks === 'function') window.renderDashboardPlaybooks();
  if (typeof window.refreshPlaybookGrid === 'function') window.refreshPlaybookGrid();
  const syncBadge = document.getElementById('cloud-sync-text');
  if (syncBadge) syncBadge.textContent = 'Cloud Synced';
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlaybookWorkstation);
} else {
  initPlaybookWorkstation();
}

