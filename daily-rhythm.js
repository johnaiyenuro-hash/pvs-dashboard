/**
 * DAILY RHYTHM EXECUTION ENGINE (REVAMPED)
 * Habakuk Operational OS // Single Pane of Glass
 * 
 * Rules:
 * 1. Core Source of Truth: PVS & Spanish Vision Systems
 * 2. Primary Levers: 2 high-leverage bottleneck levers (PVS & Spanish)
 * 3. Zero-Git Daily State: Checked items persist in localStorage keyed by date (YYYY-MM-DD), auto-reset at midnight
 */

(function(window) {
  'use strict';

  const PILLARS_CONFIG = [
    {
      id: 'pvs',
      name: 'Professional Vision System',
      shortName: 'PVS',
      color: '#e8ff4a',
      tagClass: 'tag-prof',
      url: './pvs/index.html',
      file: './pvs/index.html',
      defaultTargetId: 'aconex_cert',
      defaultTitle: 'Oracle Aconex: Associate → Specialist Modules',
      defaultDesc: 'Aconex CDE certification & metadata workflows',
      defaultTag: 'NOW // FOCUS'
    },
    {
      id: 'spanish',
      name: 'Spanish Vision System',
      shortName: 'Spanish',
      color: '#4a9fff',
      tagClass: 'tag-spanish',
      url: './spanish/index.html',
      file: './spanish/index.html',
      defaultTargetId: 'spanish_vocab_input',
      defaultTitle: 'Daily Spanish Vocabulary Input (15 words)',
      defaultDesc: '1,000 Most Common Spanish Words high-frequency deck (Memrise/Anki)',
      defaultTag: '15 MIN'
    }
  ];

  function getTodayKey() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate() {
    const d = new Date();
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${days[d.getDay()]} // ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function getStorageKey() {
    return 'pvs_rhythm_state_' + getTodayKey();
  }

  function loadDailyState() {
    try {
      const raw = localStorage.getItem(getStorageKey());
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveDailyState(state) {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save daily state', e);
    }
  }

  async function queryPillarTarget(pillar) {
    // 1. Check local synced target first
    let synced = null;
    try {
      const raw = localStorage.getItem('pvs_pillar_now_' + pillar.id);
      if (raw) synced = JSON.parse(raw);
    } catch (e) {}

    // 2. Attempt dynamic live fetch (works in HTTP / server environment)
    try {
      const response = await fetch(pillar.file, { cache: 'no-store' });
      if (response.ok) {
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        
        let activeEl = null;
        if (pillar.id === 'spanish') {
          activeEl = doc.querySelector('[data-pillar="spanish"][data-status="now"]') ||
                     doc.querySelector('#spanish_vocab_input, [data-task-id="spanish_vocab_input"]');
        } else {
          activeEl = doc.querySelector('[data-status="now"]') ||
                     doc.querySelector('#aconex_cert, [data-task-id="aconex_cert"]');
        }

        if (activeEl) {
          const title = activeEl.getAttribute('data-lever-title') ||
                        activeEl.querySelector('.task-text strong, .task-text, span, div')?.innerText?.trim() ||
                        pillar.defaultTitle;
          const desc = activeEl.getAttribute('data-lever-desc') || pillar.defaultDesc;
          const tag = activeEl.getAttribute('data-lever-tag') ||
                      activeEl.querySelector('.task-tag, span[class*="tag"]')?.innerText?.trim() ||
                      pillar.defaultTag;
          const id = activeEl.getAttribute('data-task-id') || (pillar.id + '_active');

          const payload = { id, title, desc, tag, source: 'live' };
          try {
            localStorage.setItem('pvs_pillar_now_' + pillar.id, JSON.stringify(payload));
          } catch (e) {}

          return payload;
        }
      }
    } catch (err) {}

    // 3. Fallback to synced state if available
    if (synced && synced.title) {
      return {
        id: synced.id || (pillar.id + '_synced'),
        title: synced.title,
        desc: synced.desc || pillar.defaultDesc,
        tag: synced.tag || pillar.defaultTag,
        source: 'synced'
      };
    }

    // 4. Default baseline fallback
    return {
      id: pillar.id + '_default',
      title: pillar.defaultTitle,
      desc: pillar.defaultDesc,
      tag: pillar.defaultTag,
      source: 'default'
    };
  }

  async function renderDailyRhythm(containerId) {
    const root = document.getElementById(containerId);
    if (!root) return;

    const dailyState = loadDailyState();
    const todayStr = formatDisplayDate();

    // Query active targets in parallel
    const targets = await Promise.all(PILLARS_CONFIG.map(p => queryPillarTarget(p)));

    // Generate HTML
    let html = `
      <div class="rhythm-wrapper">
        <!-- TOP HUD BAR -->
        <div class="rhythm-header">
          <div class="rhythm-header-left">
            <div class="rhythm-badge">DAILY RHYTHM EXECUTION HUD</div>
            <h2 class="rhythm-title">Today's Operational Command</h2>
            <p class="rhythm-subtitle">Laser-Focused Core Levers &bull; PVS &amp; Spanish &bull; Zero-Git Local State</p>
          </div>
          <div class="rhythm-header-right">
            <div class="date-pill">${todayStr}</div>
            <div class="score-pill" id="rhythmScorePill">CALCULATING...</div>
            <button class="rhythm-reset-btn" onclick="DailyRhythm.resetToday()" title="Reset checks for today">&#x21bb; Reset Day</button>
          </div>
        </div>

        <!-- PROGRESS BAR -->
        <div class="rhythm-progress-track">
          <div class="rhythm-progress-fill" id="rhythmProgressFill" style="width: 0%;"></div>
        </div>

        <!-- PRIMARY LEVERS -->
        <div class="rhythm-section">
          <div class="rhythm-section-header">
            <span class="dot-indicator"></span>
            <span class="section-heading">PRIMARY LEVERS // TODAY'S ACTIVE BOTTLENECK TARGETS</span>
            <span class="rule-tag">2 CORE LEVERS ACTIVE</span>
          </div>
          <div class="levers-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
    `;

    PILLARS_CONFIG.forEach((pillar, idx) => {
      const target = targets[idx];
      const checkKey = 'lever_' + pillar.id + '_' + target.id;
      const isChecked = !!dailyState[checkKey];
      const targetAnchor = target.id ? ('#' + target.id) : ('#' + pillar.defaultTargetId);
      const directUrl = pillar.url.includes('#') ? pillar.url : (pillar.url + targetAnchor);

      html += `
        <div class="lever-card ${pillar.id}-card ${isChecked ? 'completed' : ''}" id="card_${checkKey}">
          <div class="lever-top">
            <a href="${directUrl}" class="lever-pillar-badge ${pillar.tagClass}" title="Go directly to ${pillar.shortName}">
              ${pillar.shortName} &nearr;
            </a>
            <span class="lever-tag">${escapeHTML(target.tag)}</span>
          </div>
          <div class="lever-body">
            <div class="rhythm-checkbox ${isChecked ? 'checked' : ''}" onclick="DailyRhythm.toggleTask('${checkKey}')" title="Mark Done Today">
              ${isChecked ? '&#10003;' : ''}
            </div>
            <div class="lever-text">
              <a href="${directUrl}" class="lever-title-link" title="Open directly in ${pillar.shortName}">
                ${target.title}
              </a>
              <div class="lever-desc">${escapeHTML(target.desc)}</div>
            </div>
          </div>
          <div class="lever-footer">
            <a href="${directUrl}" class="pillar-jump-link">
              Open in ${pillar.shortName} &rarr;
            </a>
            <span class="lever-status-label">${isChecked ? 'DONE TODAY' : 'PENDING'}</span>
          </div>
        </div>
      `;
    });

    html += `
          </div>
        </div>
      </div>
    `;

    root.innerHTML = html;
    updateProgressUI();
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[m];
    });
  }

  function toggleTask(checkKey) {
    const dailyState = loadDailyState();
    dailyState[checkKey] = !dailyState[checkKey];
    saveDailyState(dailyState);

    const isChecked = dailyState[checkKey];

    const cardEl = document.getElementById('card_' + checkKey);
    if (cardEl) {
      cardEl.classList.toggle('completed', isChecked);
      const box = cardEl.querySelector('.rhythm-checkbox');
      if (box) {
        box.classList.toggle('checked', isChecked);
        box.innerHTML = isChecked ? '&#10003;' : '';
      }
      const label = cardEl.querySelector('.lever-status-label');
      if (label) {
        label.innerText = isChecked ? 'DONE TODAY' : 'PENDING';
      }
    }

    updateProgressUI();
  }

  function updateProgressUI() {
    const dailyState = loadDailyState();
    const totalItems = PILLARS_CONFIG.length;
    let completed = 0;

    PILLARS_CONFIG.forEach(pillar => {
      Object.keys(dailyState).forEach(k => {
        if (k.startsWith('lever_' + pillar.id + '_') && dailyState[k]) completed++;
      });
    });

    const percent = Math.min(100, Math.round((completed / totalItems) * 100));

    const scorePill = document.getElementById('rhythmScorePill');
    if (scorePill) {
      scorePill.innerText = `${completed}/${totalItems} (${percent}%)`;
      if (percent === 100) {
        scorePill.classList.add('perfect');
      } else {
        scorePill.classList.remove('perfect');
      }
    }

    const fillBar = document.getElementById('rhythmProgressFill');
    if (fillBar) {
      fillBar.style.width = percent + '%';
      if (percent === 100) {
        fillBar.style.background = 'var(--accent2)';
      } else {
        fillBar.style.background = 'linear-gradient(90deg, var(--accent4), var(--accent2))';
      }
    }
  }

  function resetToday() {
    if (confirm('Reset core daily lever checks for today?')) {
      saveDailyState({});
      renderDailyRhythm('daily-rhythm-container');
    }
  }

  // Auto-check date rollover every minute
  let activeDateKey = getTodayKey();
  setInterval(() => {
    const newKey = getTodayKey();
    if (newKey !== activeDateKey) {
      activeDateKey = newKey;
      renderDailyRhythm('daily-rhythm-container');
    }
  }, 60000);

  // Expose API
  window.DailyRhythm = {
    init: renderDailyRhythm,
    toggleTask: toggleTask,
    resetToday: resetToday
  };

})(typeof window !== 'undefined' ? window : globalThis);
