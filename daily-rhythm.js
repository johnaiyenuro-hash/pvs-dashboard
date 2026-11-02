/**
 * DAILY RHYTHM EXECUTION ENGINE
 * Habakuk Operational OS // Single Pane of Glass
 * 
 * Rules:
 * 1. Sole Source of Truth: 4 vision systems (PVS, Spanish, Mercor, Health)
 * 2. Rule of 4: Strictly query strictly ONE primary target per pillar (max 4 levers)
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
      url: './pvs/',
      file: './pvs/index.html',
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
      url: './spanish/',
      file: './spanish/index.html',
      defaultTitle: 'Daily Spanish Vocabulary Input (15 words)',
      defaultDesc: '1,000 Most Common Spanish Words high-frequency deck (Memrise/Anki)',
      defaultTag: '15 MIN'
    },
    {
      id: 'mercor',
      name: 'Mercor AI Contracting',
      shortName: 'Mercor',
      color: '#c084fc',
      tagClass: 'tag-mercor',
      url: './mercor/',
      file: './mercor/index.html',
      defaultTitle: 'Add Glider Tech to top CV slot & sync LinkedIn',
      defaultDesc: 'Update CV PDF & LinkedIn with CDE Information Mgmt role',
      defaultTag: '10M // UNLOCKED'
    },
    {
      id: 'health',
      name: 'Health & Weight Loss OS',
      shortName: 'Health',
      color: '#ff6b4a',
      tagClass: 'tag-health',
      url: './health/',
      file: './health/index.html',
      defaultTitle: '16:8 Fasting Respected (12:00 – 20:00 Window)',
      defaultDesc: 'Zero calories before 12:00 PM; eating cutoff at 20:00 PM',
      defaultTag: 'FASTING'
    }
  ];

  const CADENCE_BLOCKS = [
    {
      id: 'morning',
      title: '01 // MORNING CADENCE',
      timeWindow: '07:00 – 12:00',
      subtitle: 'Primer, Fasted NEAT & High-Leverage Deep Work',
      tasks: [
        { id: 'cad_am_primer', label: 'AM Primer & Fasted Weigh-In', note: 'Warm water primer + morning scale log upon wake' },
        { id: 'cad_priority_align', label: 'Priority Alignment', note: "Review Today's 4 Levers; lock single focus outcome" },
        { id: 'cad_deep_work', label: 'High-Leverage Focus Block', note: 'Deep cognitive work block while insulin is low' }
      ]
    },
    {
      id: 'midday',
      title: '02 // MIDDAY CADENCE',
      timeWindow: '12:00 – 17:00',
      subtitle: 'Refuel, Movement Floor & Operational Rhythm',
      tasks: [
        { id: 'cad_break_fast', label: 'Break Fast & Protein Anchor (12:00 PM)', note: '≥40-50g protein first meal, high satiety whole foods' },
        { id: 'cad_movement_step', label: 'Midday Movement Check (≥5,000 steps)', note: 'Midday outdoor walk to build baseline NEAT' },
        { id: 'cad_operational_sync', label: 'Operational Rhythm Sync', note: 'Clear communications & pipeline calibration' }
      ]
    },
    {
      id: 'evening',
      title: '03 // EVENING CADENCE',
      timeWindow: '17:00 – 23:00',
      subtitle: 'Input Loop, Fasting Cutoff & Cortisol Reset',
      tasks: [
        { id: 'cad_habit_input', label: 'Spanish Input Loop (15m)', note: 'High-frequency vocabulary deck or audio immersion' },
        { id: 'cad_fasting_lock', label: 'Fasting Window Lock (<20:00 PM)', note: 'Dinner finalized before 8:00 PM; fast begins' },
        { id: 'cad_shutdown_sleep', label: 'Daily Shutdown & Sleep (<23:00 PM)', note: 'Review daily checklist; asleep before 11:00 PM' }
      ]
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
        // ENFORCE RULE OF 4: Query strictly the FIRST active item per pillar
        const activeEl = doc.querySelector('[data-status="now"]');
        if (activeEl) {
          const title = activeEl.getAttribute('data-lever-title') ||
                        activeEl.querySelector('.task-text, span, div')?.innerText?.trim() ||
                        pillar.defaultTitle;
          const desc = activeEl.getAttribute('data-lever-desc') || pillar.defaultDesc;
          const tag = activeEl.getAttribute('data-lever-tag') ||
                      activeEl.querySelector('.task-tag, span[class*="tag"]')?.innerText?.trim() ||
                      pillar.defaultTag;
          const id = activeEl.getAttribute('data-task-id') || (pillar.id + '_active');

          const payload = {
            id,
            title,
            desc,
            tag,
            source: 'live'
          };
          // Cache to localStorage for fast subsequent loads
          try {
            localStorage.setItem('pvs_pillar_now_' + pillar.id, JSON.stringify(payload));
          } catch (e) {}

          return payload;
        }
      }
    } catch (err) {
      // Fetch may fail in local file:// protocol due to CORS; fallback gracefully
    }

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

    // Query the 4 active targets in parallel (strictly 1 per pillar)
    const targets = await Promise.all(PILLARS_CONFIG.map(p => queryPillarTarget(p)));

    // Generate HTML
    let html = `
      <div class="rhythm-wrapper">
        <!-- TOP HUD BAR -->
        <div class="rhythm-header">
          <div class="rhythm-header-left">
            <div class="rhythm-badge">DAILY RHYTHM EXECUTION HUD</div>
            <h2 class="rhythm-title">Today's Operational Command</h2>
            <p class="rhythm-subtitle">Dynamic Bottleneck Pull &bull; Rule of 4 &bull; Zero-Git Local State</p>
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

        <!-- SECTION 1: TODAY'S 4 PRIMARY LEVERS -->
        <div class="rhythm-section">
          <div class="rhythm-section-header">
            <span class="dot-indicator"></span>
            <span class="section-heading">PRIMARY LEVERS // TODAY'S 4 ACTIVE BOTTLENECK TARGETS</span>
            <span class="rule-tag">RULE OF 4 ACTIVE</span>
          </div>
          <div class="levers-grid">
    `;

    PILLARS_CONFIG.forEach((pillar, idx) => {
      const target = targets[idx];
      const checkKey = 'lever_' + pillar.id + '_' + target.id;
      const isChecked = !!dailyState[checkKey];

      html += `
        <div class="lever-card ${pillar.id}-card ${isChecked ? 'completed' : ''}" id="card_${checkKey}">
          <div class="lever-top">
            <span class="lever-pillar-badge ${pillar.tagClass}">${pillar.shortName}</span>
            <span class="lever-tag">${escapeHTML(target.tag)}</span>
          </div>
          <div class="lever-body" onclick="DailyRhythm.toggleTask('${checkKey}')">
            <div class="rhythm-checkbox ${isChecked ? 'checked' : ''}">
              ${isChecked ? '&#10003;' : ''}
            </div>
            <div class="lever-text">
              <div class="lever-title">${target.title}</div>
              <div class="lever-desc">${escapeHTML(target.desc)}</div>
            </div>
          </div>
          <div class="lever-footer">
            <a href="${pillar.url}" class="pillar-jump-link">
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

        <!-- SECTION 2: CHRONOLOGICAL CADENCE BLOCKS -->
        <div class="rhythm-section">
          <div class="rhythm-section-header">
            <span class="dot-indicator green"></span>
            <span class="section-heading">DAILY RHYTHM CADENCE // CHRONOLOGICAL BLOCKS</span>
            <span class="rule-tag">3 BLOCKS</span>
          </div>
          <div class="cadence-grid">
    `;

    CADENCE_BLOCKS.forEach((block) => {
      html += `
        <div class="cadence-card">
          <div class="cadence-header">
            <div>
              <div class="cadence-title">${block.title}</div>
              <div class="cadence-window">${block.timeWindow}</div>
            </div>
          </div>
          <div class="cadence-sub">${block.subtitle}</div>
          <div class="cadence-tasks">
      `;

      block.tasks.forEach((task) => {
        const checkKey = 'cadence_' + task.id;
        const isChecked = !!dailyState[checkKey];

        html += `
          <div class="cadence-task-item ${isChecked ? 'completed' : ''}" onclick="DailyRhythm.toggleTask('${checkKey}')" id="task_${checkKey}">
            <div class="rhythm-checkbox small ${isChecked ? 'checked' : ''}">
              ${isChecked ? '&#10003;' : ''}
            </div>
            <div class="cadence-task-text">
              <div class="cadence-task-label">${escapeHTML(task.label)}</div>
              <div class="cadence-task-note">${escapeHTML(task.note)}</div>
            </div>
          </div>
        `;
      });

      html += `
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

    // Update UI dynamically
    const isChecked = dailyState[checkKey];

    // Check if lever card
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

    // Check if cadence item
    const taskEl = document.getElementById('task_' + checkKey);
    if (taskEl) {
      taskEl.classList.toggle('completed', isChecked);
      const box = taskEl.querySelector('.rhythm-checkbox');
      if (box) {
        box.classList.toggle('checked', isChecked);
        box.innerHTML = isChecked ? '&#10003;' : '';
      }
    }

    updateProgressUI();
  }

  function updateProgressUI() {
    const dailyState = loadDailyState();

    // Total tasks = 4 Primary Levers + 9 Cadence tasks = 13 tasks
    let total = 4;
    CADENCE_BLOCKS.forEach(b => { total += b.tasks.length; });

    let completed = 0;
    Object.keys(dailyState).forEach(k => {
      if (dailyState[k]) completed++;
    });

    const percent = Math.round((completed / total) * 100);

    const scorePill = document.getElementById('rhythmScorePill');
    if (scorePill) {
      scorePill.innerText = `${completed}/${total} (${percent}%)`;
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
    if (confirm('Reset all daily checks for today?')) {
      saveDailyState({});
      // Re-render
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

})(window);
