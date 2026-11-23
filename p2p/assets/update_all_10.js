const fs = require('fs');
const path = require('path');

const p2pPath = 'C:\\Users\\johna\\pvs-dashboard\\p2p\\index.html';
const pvsPath = 'C:\\Users\\johna\\pvs-dashboard\\pvs\\index.html';
const metaPath = 'C:\\Users\\johna\\pvs-dashboard\\p2p\\assets\\logos-metadata.json';

const logos = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

// 1. UPDATE P2P/INDEX.HTML
let p2pContent = fs.readFileSync(p2pPath, 'utf8');

// Build tabs
const tabsHtml = `          <div class="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 flex-wrap" id="logo-tabs">
` + logos.map((logo, idx) => {
  const numPad = String(idx + 1).padStart(2, '0');
  const shortName = logo.name.split('(')[1]?.replace(')', '') || logo.name;
  return `            <button class="logo-tab ${idx === 0 ? 'active' : ''} px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${idx === 0 ? 'bg-red-600 text-white shadow-glow-red' : 'text-slate-400 hover:text-white'} flex items-center gap-1.5" data-logo="${logo.key}">
              <span class="text-[10px] opacity-70">${numPad}</span>
              <span>${shortName}</span>
            </button>`;
}).join('\n') + `\n          </div>`;

// Replace #logo-tabs block
p2pContent = p2pContent.replace(
  /<div class="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 flex-wrap" id="logo-tabs">[\s\S]*?<\/div>/,
  tabsHtml
);

// Build downloads grid
const downloadsHtml = `              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-[11px] font-mono">
` + logos.map((logo, idx) => {
  return `                <a href="assets/forkpin-${logo.id}.svg" download class="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700/60 flex items-center justify-between transition-colors">
                  <span class="flex items-center gap-1.5 truncate">
                    <span class="text-rose-400">❖</span>
                    <span class="truncate">forkpin-${logo.id}.svg</span>
                  </span>
                  <span class="text-[10px] text-slate-400 font-bold ml-1">v${idx + 1}</span>
                </a>`;
}).join('\n') + `\n              </div>`;

// Replace downloads grid block (matches grid after Figma & Icon Asset Downloads)
p2pContent = p2pContent.replace(
  /<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-\[11px\] font-mono">[\s\S]*?<\/div>/,
  downloadsHtml
);

// Build LOGO_CONCEPTS JS object
const conceptsCode = 'const LOGO_CONCEPTS = {\n' + logos.map(logo => {
  return `      ${logo.key}: {
        name: ${JSON.stringify(logo.name)},
        label: ${JSON.stringify(logo.label)},
        desc: ${JSON.stringify(logo.desc)},
        bestFor: ${JSON.stringify(logo.bestFor)},
        imageSrc: ${JSON.stringify(`assets/forkpin-${logo.id}-512.png`)},
        svgFile: ${JSON.stringify(`assets/forkpin-${logo.id}.svg`)},
        palette: ${JSON.stringify(logo.palette)},
        badgeHtml: ${JSON.stringify(`<span class="w-2 h-2 rounded-full bg-red-400"></span><span class="font-bold">${logo.badgeText}</span>`)},
        badgeClass: ${JSON.stringify(logo.badgeClass)},
        squircleClass: ${JSON.stringify(logo.squircleClass)},
        svg: ${JSON.stringify(logo.svg512)},
        faviconSvg: ${JSON.stringify(`<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="#0A0B10"/><circle cx="50" cy="50" r="44" stroke="#E60023" stroke-width="4" fill="none" opacity="0.4"/><circle cx="50" cy="30" r="14" fill="#E60023"/><path d="M 50,44 L 50,86 M 42,54 L 42,76 M 58,54 L 58,76" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>`)}
      }`;
}).join(',\n\n') + '\n    };';

// Replace LOGO_CONCEPTS in p2p
p2pContent = p2pContent.replace(
  /const LOGO_CONCEPTS = \{[\s\S]*?\n    \};/,
  conceptsCode
);

// Replace cycling logic in renderLogoConcept and btnToggleRevision in p2p
const cyclingLogicOld = `      // Update toggle button text (Cycling: v1 -> v2 -> v3 -> v1)
      if (toggleRevisionText) {
        if (key === 'forkpin_v1') {
          toggleRevisionText.innerHTML = \`Switch to Revised ForkPin (v2) ✨\`;
        } else if (key === 'forkpin_v2') {
          toggleRevisionText.innerHTML = \`Switch to Geometric Crest (v3) ⚡\`;
        } else {
          toggleRevisionText.innerHTML = \`Switch to Original ForkPin (v1) ↩\`;
        }
      }`;

const cyclingLogicNew = `      // Dynamic 10-logo cycling prompt
      const LOGO_KEYS = Object.keys(LOGO_CONCEPTS);
      const currIdx = LOGO_KEYS.indexOf(key);
      const nextIdx = (currIdx + 1) % LOGO_KEYS.length;
      const nextConcept = LOGO_CONCEPTS[LOGO_KEYS[nextIdx]];
      if (toggleRevisionText) {
        toggleRevisionText.innerHTML = \`Cycle Next (\${nextConcept.label.split('//')[1].trim()}) ✨ [\${currIdx + 1}/10]\`;
      }`;

p2pContent = p2pContent.replace(cyclingLogicOld, cyclingLogicNew);

const btnToggleOld = `    if (btnToggleRevision) {
      btnToggleRevision.onclick = () => {
        if (activeLogoKey === 'forkpin_v1') {
          activeLogoKey = 'forkpin_v2';
        } else if (activeLogoKey === 'forkpin_v2') {
          activeLogoKey = 'forkpin_v3';
        } else {
          activeLogoKey = 'forkpin_v1';
        }
        localStorage.setItem('p2p_active_logo', activeLogoKey);
        updateLogoTabsUi(activeLogoKey);
        renderLogoConcept(activeLogoKey);
      };
    }`;

const btnToggleNew = `    const LOGO_KEYS = Object.keys(LOGO_CONCEPTS);
    if (btnToggleRevision) {
      btnToggleRevision.onclick = () => {
        const currIdx = LOGO_KEYS.indexOf(activeLogoKey);
        const nextIdx = (currIdx + 1) % LOGO_KEYS.length;
        activeLogoKey = LOGO_KEYS[nextIdx];
        localStorage.setItem('p2p_active_logo', activeLogoKey);
        updateLogoTabsUi(activeLogoKey);
        renderLogoConcept(activeLogoKey);
      };
    }`;

p2pContent = p2pContent.replace(btnToggleOld, btnToggleNew);

fs.writeFileSync(p2pPath, p2pContent, 'utf8');
console.log('✅ Updated p2p/index.html with all 10 logos, tabs, downloads and cycler!');


// 2. UPDATE PVS/INDEX.HTML (PROFESSIONAL DASHBOARD)
let pvsContent = fs.readFileSync(pvsPath, 'utf8');

// Replace togglePvsLogo with 10-logo cycler
const pvsToggleOld = `    function togglePvsLogo() {
      const img = document.getElementById('pvs-forkpin-logo');
      const navImg = document.getElementById('nav-p2p-logo');
      const btn = document.getElementById('pvs-logo-toggle-btn');
      const label = document.getElementById('pvs-logo-ver-badge');
      if (!img) return;
      if (img.src.includes('forkpin-v2.svg')) {
        img.src = '../p2p/assets/forkpin-v3.svg';
        if (navImg) navImg.src = '../p2p/assets/forkpin-v3.svg';
        if (btn) btn.innerHTML = 'Switch to Original (v1) &larr;';
        if (label) label.textContent = 'FORKPIN V3 CREST';
      } else if (img.src.includes('forkpin-v3.svg')) {
        img.src = '../p2p/assets/forkpin.svg';
        if (navImg) navImg.src = '../p2p/assets/forkpin.svg';
        if (btn) btn.innerHTML = 'Switch to Revised (v2) ✨';
        if (label) label.textContent = 'FORKPIN V1 ORIGINAL';
      } else {
        img.src = '../p2p/assets/forkpin-v2.svg';
        if (navImg) navImg.src = '../p2p/assets/forkpin-v2.svg';
        if (btn) btn.innerHTML = 'Switch to Geometric (v3) ⚡';
        if (label) label.textContent = 'FORKPIN V2 APEX';
      }
    }`;

const pvsLogosList = logos.map(l => ({
  id: l.id,
  name: l.name.split('(')[1]?.replace(')', '') || l.name,
  badge: l.label.toUpperCase()
}));

const pvsToggleNew = `    const PVS_LOGOS = ${JSON.stringify(pvsLogosList, null, 6)};

    function togglePvsLogo() {
      const img = document.getElementById('pvs-forkpin-logo');
      const navImg = document.getElementById('nav-p2p-logo');
      const btn = document.getElementById('pvs-logo-toggle-btn');
      const label = document.getElementById('pvs-logo-ver-badge');
      if (!img) return;
      let currIdx = PVS_LOGOS.findIndex(l => img.src.includes('forkpin-' + l.id + '.svg') || img.src.includes('forkpin-' + l.id + '-512.png'));
      if (currIdx === -1) currIdx = 0;
      const nextIdx = (currIdx + 1) % PVS_LOGOS.length;
      const nextLogo = PVS_LOGOS[nextIdx];
      const afterNextIdx = (nextIdx + 1) % PVS_LOGOS.length;
      const afterNextLogo = PVS_LOGOS[afterNextIdx];

      img.src = '../p2p/assets/forkpin-' + nextLogo.id + '.svg';
      if (navImg) navImg.src = '../p2p/assets/forkpin-' + nextLogo.id + '.svg';
      if (label) label.textContent = 'FORKPIN ' + nextLogo.badge;
      if (btn) btn.innerHTML = 'Cycle Next (' + afterNextLogo.name + ') &rarr; [' + (nextIdx + 1) + '/10]';
      try { localStorage.setItem('pvs_active_logo_id', nextLogo.id); } catch(e){}
    }`;

pvsContent = pvsContent.replace(pvsToggleOld, pvsToggleNew);

// In the card in pvs/index.html, update initial button text and badge
pvsContent = pvsContent.replace(
  /<button type="button" onclick="togglePvsLogo\(\)" id="pvs-logo-toggle-btn"[\s\S]*?<\/button>/,
  `<button type="button" onclick="togglePvsLogo()" id="pvs-logo-toggle-btn" class="back-btn" style="border-color: rgba(244, 63, 94, 0.5); color: #fb7185; background: rgba(244, 63, 94, 0.12); cursor: pointer; font-size: 11px;">Cycle Next (Apex Flame) &rarr; [1/10]</button>`
);

pvsContent = pvsContent.replace(
  /<span id="pvs-logo-ver-badge"[\s\S]*?<\/span>/,
  `<span id="pvs-logo-ver-badge" style="padding: 4px 10px; background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.35); color: #fb7185; border-radius: 2px; font-weight: 700;">FORKPIN V01 // CLASSIC CERAMIC</span>`
);

fs.writeFileSync(pvsPath, pvsContent, 'utf8');
console.log('✅ Updated pvs/index.html with full 10-logo cycler!');
