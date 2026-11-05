/**
 * DAILY RHYTHM EXECUTION ENGINE
 * Habakuk Operational OS // Single Pane of Glass
 * 
 * Rules:
 * 1. Sole Source of Truth: 5 vision systems (PVS, Spanish, Nomad Visa, Mercor, Health)
 * 2. Primary Levers: 1 primary bottleneck lever per pillar + Health Daily Execution Stack dropdown
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
    },
    {
      id: 'dnv',
      name: 'Nomad Visa & Barcelona Recce',
      shortName: 'Nomad Visa',
      color: '#2dd4bf',
      tagClass: 'tag-dnv',
      url: './spanish/index.html#recce_transit_housing',
      file: './spanish/index.html',
      defaultTargetId: 'recce_transit_housing',
      defaultTitle: 'Pillar 1: Transit, Housing & Urban Mobility Stack',
      defaultDesc: 'Lock Sant Andreu accommodation & T-usual pass (Flights confirmed: easyJet 5–20 Dec)',
      defaultTag: 'NOW // PREREQ'
    },
    {
      id: 'mercor',
      name: 'Mercor AI Contracting',
      shortName: 'Mercor',
      color: '#c084fc',
      tagClass: 'tag-mercor',
      url: './mercor/index.html',
      file: './mercor/index.html',
      defaultTargetId: 'mercor_ai_interview',
      defaultTitle: 'Record Mercor AI Interview (STAR Answers)',
      defaultDesc: 'Verbalize WCS, BEP & ISO 19650 anchors for Tier 1 roles',
      defaultTag: '20M // ACTIVE GATE'
    },
    {
      id: 'health',
      name: 'Health & Weight Loss OS',
      shortName: 'Health',
      color: '#ff6b4a',
      tagClass: 'tag-health',
      url: './health/index.html#fit_fasting',
      file: './health/index.html',
      isStack: true,
      defaultTargetId: 'fit_fasting',
      defaultTitle: 'Daily Weight Loss Execution Stack',
      defaultDesc: 'Mandatory daily protocol: Fasting, Scale Log, Deficit, Protein, Steps, Water, Sleep',
      defaultTag: 'DAILY STACK'
    }
  ];

  const HEALTH_STACK_ITEMS = [
    { id: 'fit_fasting', title: '16:8 Fasting Respected', desc: '12:00 – 20:00 window (0 cal before 12 PM)', tag: 'FASTING', color: '#c084fc' },
    { id: 'fit_weighin_daily', title: 'Morning Weigh-in Recorded', desc: 'Fasted, post-toilet, on hard floor', tag: 'SCALE LOG', color: '#4a9fff' },
    { id: 'fit_deficit', title: 'Calorie Deficit Enforced', desc: '~1,850–2,050 kcal cap / snack ≤150 kcal', tag: 'DEFICIT', color: '#ff6b4a' },
    { id: 'fit_protein', title: 'Protein Floor Locked', desc: '≥150g protein to shield lean muscle mass', tag: 'PROTEIN', color: '#4affb4' },
    { id: 'fit_steps', title: 'Movement Floor (10,000+ Steps)', desc: 'Primary fat oxidation & baseline NEAT', tag: 'NEAT', color: '#ff6b4a' },
    { id: 'fit_water', title: 'Hydration Base (2.5L – 3.0L)', desc: 'Pure water hydration throughout day', tag: 'HYDRATION', color: '#4a9fff' },
    { id: 'fit_warm_water', title: 'Morning Primer (Warm Water)', desc: 'Warm water on waking for gut motility', tag: 'PRIMER', color: '#4a9fff' },
    { id: 'fit_sleep', title: 'Sleep & Cortisol Cutoff', desc: 'In bed before 11:00 PM to curb late hunger', tag: 'RECOVERY', color: '#ff6b4a' }
  ];

  const CADENCE_BLOCKS = [
    {
      id: 'morning',
      title: '01 // MORNING CADENCE',
      timeWindow: '07:00 – 12:00',
      subtitle: 'Primer, Fasted NEAT & High-Leverage Deep Work',
      tasks: [
        { id: 'cad_am_primer', label: 'AM Primer & Fasted Weigh-In', note: 'Warm water primer + morning scale log upon wake' },
        { id: 'cad_priority_align', label: 'Priority Alignment', note: "Review Today's Levers; lock single focus outcome" },
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
    if (pillar.isStack) {
      return {
        id: 'health_stack',
        title: pillar.defaultTitle,
        desc: pillar.defaultDesc,
        tag: pillar.defaultTag,
        source: 'stack'
      };
    }

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
        if (pillar.id === 'dnv') {
          activeEl = doc.querySelector('[data-pillar="dnv"][data-status="now"]') ||
                     doc.querySelector('#recce_transit_housing, [data-task-id="recce_transit_housing"]') ||
                     doc.querySelector('#dnv_clause_perm_letter, [data-task-id="dnv_clause_perm_letter"]');
        } else if (pillar.id === 'spanish') {
          activeEl = doc.querySelector('[data-pillar="spanish"][data-status="now"]') ||
                     doc.querySelector('#spanish_vocab_input, [data-task-id="spanish_vocab_input"]');
        } else {
          activeEl = doc.querySelector('[data-status="now"]');
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

    // Query the active targets in parallel
    const targets = await Promise.all(PILLARS_CONFIG.map(p => queryPillarTarget(p)));

    // Generate HTML
    let html = `
      <div class="rhythm-wrapper">
        <!-- TOP HUD BAR -->
        <div class="rhythm-header">
          <div class="rhythm-header-left">
            <div class="rhythm-badge">DAILY RHYTHM EXECUTION HUD</div>
            <h2 class="rhythm-title">Today's Operational Command</h2>
            <p class="rhythm-subtitle">Dynamic Bottleneck Pull &bull; 5 Pillars &bull; Zero-Git Local State</p>
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

        <!-- SECTION 1: PRIMARY LEVERS -->
        <div class="rhythm-section">
          <div class="rhythm-section-header">
            <span class="dot-indicator"></span>
            <span class="section-heading">PRIMARY LEVERS // TODAY'S ACTIVE BOTTLENECK TARGETS</span>
            <span class="rule-tag">5 PILLARS ACTIVE</span>
          </div>
          <div class="levers-grid">
    `;

    PILLARS_CONFIG.forEach((pillar, idx) => {
      const target = targets[idx];

      if (pillar.isStack) {
        // HEALTH EXECUTION STACK WITH DROPDOWN
        let doneCount = 0;
        HEALTH_STACK_ITEMS.forEach(item => {
          if (dailyState['lever_health_' + item.id]) doneCount++;
        });
        const isAllDone = doneCount === HEALTH_STACK_ITEMS.length;
        const isExpanded = dailyState['health_stack_expanded'] !== false;

        html += `
          <div class="lever-card health-card health-stack-card ${isAllDone ? 'completed' : ''}" id="card_lever_health_stack">
            <div class="lever-top">
              <a href="${pillar.url}" class="lever-pillar-badge ${pillar.tagClass}" title="Go directly to ${pillar.shortName}">
                ${pillar.shortName} &nearr;
              </a>
              <div class="health-stack-pills">
                <span class="health-count-badge ${isAllDone ? 'done' : ''}" id="healthCountBadge">${doneCount}/${HEALTH_STACK_ITEMS.length} DONE</span>
                <span class="lever-tag">${escapeHTML(target.tag)}</span>
              </div>
            </div>

            <div class="health-stack-header">
              <div class="health-stack-title-row">
                <a href="${pillar.url}" class="lever-title-link" title="Open Health OS">
                  ${target.title}
                </a>
                <button type="button" class="health-dropdown-toggle-btn" onclick="DailyRhythm.toggleHealthDropdown(event)" title="Toggle daily stack drawer">
                  <span id="healthDropdownBtnLabel">${isExpanded ? 'Collapse' : 'Expand'}</span>
                  <span class="dropdown-chevron ${isExpanded ? 'open' : ''}">▼</span>
                </button>
              </div>
              <div class="health-stack-progress-track">
                <div class="health-stack-progress-fill" id="healthStackProgressFill" style="width: ${(doneCount / HEALTH_STACK_ITEMS.length) * 100}%;"></div>
              </div>
            </div>

            <!-- Expandable Stack Dropdown Drawer -->
            <div class="health-stack-drawer ${isExpanded ? 'expanded' : 'collapsed'}" id="healthStackDrawer">
              <div class="health-stack-list">
        `;

        HEALTH_STACK_ITEMS.forEach(item => {
          const itemKey = 'lever_health_' + item.id;
          const itemChecked = !!dailyState[itemKey];
          html += `
            <div class="health-stack-row ${itemChecked ? 'checked' : ''}" id="row_${itemKey}" onclick="DailyRhythm.toggleTask('${itemKey}')">
              <div class="rhythm-checkbox ${itemChecked ? 'checked' : ''}">
                ${itemChecked ? '&#10003;' : ''}
              </div>
              <div class="health-stack-info">
                <div class="health-stack-row-title">${item.title}</div>
                <div class="health-stack-row-desc">${item.desc}</div>
              </div>
              <span class="health-stack-row-tag" style="color: ${item.color}; border: 1px solid ${item.color}40; background: ${item.color}15;">
                ${item.tag}
              </span>
            </div>
          `;
        });

        html += `
              </div>
            </div>

            <div class="lever-footer">
              <a href="${pillar.url}" class="pillar-jump-link">
                Open in ${pillar.shortName} &rarr;
              </a>
              <span class="lever-status-label" id="healthStackStatusLabel">${isAllDone ? 'ALL 8 HABITS COMPLETED' : `${doneCount}/${HEALTH_STACK_ITEMS.length} COMPLETED TODAY`}</span>
            </div>
          </div>
        `;
      } else {
        // STANDARD SINGLE-LEVER CARD
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
      }
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
        <div class="cadence-block" id="block_${block.id}">
          <div class="cadence-block-header">
            <div>
              <div class="cadence-title">${block.title}</div>
              <div class="cadence-subtitle">${block.subtitle}</div>
            </div>
            <span class="cadence-time">${block.timeWindow}</span>
          </div>
          <div class="cadence-tasks">
      `;

      block.tasks.forEach((t) => {
        const checkKey = 'cad_' + t.id;
        const isChecked = !!dailyState[checkKey];

        html += `
          <div class="cadence-task-row ${isChecked ? 'completed' : ''}" id="task_${checkKey}" onclick="DailyRhythm.toggleTask('${checkKey}')">
            <div class="rhythm-checkbox ${isChecked ? 'checked' : ''}">
              ${isChecked ? '&#10003;' : ''}
            </div>
            <div class="cadence-task-info">
              <div class="cadence-task-label">${t.label}</div>
              <div class="cadence-task-note">${t.note}</div>
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

  function toggleHealthDropdown(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const state = loadDailyState();
    const current = state['health_stack_expanded'] !== false;
    state['health_stack_expanded'] = !current;
    saveDailyState(state);

    const drawer = document.getElementById('healthStackDrawer');
    const label = document.getElementById('healthDropdownBtnLabel');
    const chevron = document.querySelector('.dropdown-chevron');
    if (drawer) {
      drawer.classList.toggle('collapsed', current);
      drawer.classList.toggle('expanded', !current);
    }
    if (label) {
      label.innerText = current ? 'Expand' : 'Collapse';
    }
    if (chevron) {
      chevron.classList.toggle('open', !current);
    }
  }

  function toggleTask(checkKey) {
    const dailyState = loadDailyState();
    dailyState[checkKey] = !dailyState[checkKey];
    saveDailyState(dailyState);

    const isChecked = dailyState[checkKey];

    // Check if single lever card
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

    // Check if health stack item row
    const rowEl = document.getElementById('row_' + checkKey);
    if (rowEl) {
      rowEl.classList.toggle('checked', isChecked);
      const box = rowEl.querySelector('.rhythm-checkbox');
      if (box) {
        box.classList.toggle('checked', isChecked);
        box.innerHTML = isChecked ? '&#10003;' : '';
      }
      // Update health stack counters
      let doneCount = 0;
      HEALTH_STACK_ITEMS.forEach(item => {
        if (dailyState['lever_health_' + item.id]) doneCount++;
      });
      const isAllDone = doneCount === HEALTH_STACK_ITEMS.length;

      const badge = document.getElementById('healthCountBadge');
      if (badge) {
        badge.innerText = `${doneCount}/${HEALTH_STACK_ITEMS.length} DONE`;
        badge.classList.toggle('done', isAllDone);
      }
      const fill = document.getElementById('healthStackProgressFill');
      if (fill) {
        fill.style.width = `${(doneCount / HEALTH_STACK_ITEMS.length) * 100}%`;
      }
      const statusLabel = document.getElementById('healthStackStatusLabel');
      if (statusLabel) {
        statusLabel.innerText = isAllDone ? 'ALL 8 HABITS COMPLETED' : `${doneCount}/${HEALTH_STACK_ITEMS.length} COMPLETED TODAY`;
      }
      const stackCard = document.getElementById('card_lever_health_stack');
      if (stackCard) {
        stackCard.classList.toggle('completed', isAllDone);
      }
    }

    // Check if cadence task
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

    // 4 single primary levers (pvs, spanish, dnv, mercor) + 8 health stack items + 9 cadence items = 21 items
    const singleLeverPillars = ['pvs', 'spanish', 'dnv', 'mercor'];
    let totalItems = singleLeverPillars.length + HEALTH_STACK_ITEMS.length;
    CADENCE_BLOCKS.forEach(b => { totalItems += b.tasks.length; });

    let completed = 0;

    // Single levers
    singleLeverPillars.forEach(pId => {
      Object.keys(dailyState).forEach(k => {
        if (k.startsWith('lever_' + pId + '_') && dailyState[k]) completed++;
      });
    });

    // Health stack items
    HEALTH_STACK_ITEMS.forEach(item => {
      if (dailyState['lever_health_' + item.id]) completed++;
    });

    // Cadence tasks
    CADENCE_BLOCKS.forEach(b => {
      b.tasks.forEach(t => {
        if (dailyState['cad_' + t.id]) completed++;
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
    if (confirm('Reset all daily checks for today?')) {
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
    toggleHealthDropdown: toggleHealthDropdown,
    resetToday: resetToday
  };

})(window);
