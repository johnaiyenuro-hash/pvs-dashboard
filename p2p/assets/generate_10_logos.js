const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const assetsDir = __dirname;

const logos = [
  {
    id: 'v1',
    key: 'forkpin_v1',
    name: 'The ForkPin (v1 Original)',
    label: 'v01 // Classic Ceramic',
    desc: 'The original breakthrough concept: a pushpin top with 3 fork tines piercing downward through a concentric dark ceramic dinner plate.',
    bestFor: 'Classic culinary D2C brand, recipe card watermarks, recognizable tangible storytelling.',
    palette: [
      { name: 'Pin Red', hex: '#E60023', text: '#fff' },
      { name: 'Ceramic Obsidian', hex: '#0D1321', text: '#fff' },
      { name: 'Steel Gleam', hex: '#E2E8F0', text: '#000' }
    ],
    badgeText: 'v1 Original',
    badgeClass: 'border-red-500/40 bg-red-950/40 text-red-300',
    squircleClass: 'bg-gradient-to-tr from-red-600 to-rose-700 shadow-glow-red',
    svg512: fs.readFileSync(path.join(assetsDir, 'forkpin.svg'), 'utf8')
  },
  {
    id: 'v2',
    key: 'forkpin_v2',
    name: 'The ForkPin (v2 Apex)',
    label: 'v02 // Speed Arc & Flame',
    desc: 'Aerodynamic bevel with golden-ratio curved outer tines and an active velocity orbital ring signifying rapid 1-click cart transfer.',
    bestFor: 'Modern tech scale-up, high-contrast dark interfaces, speed-oriented pitch decks.',
    palette: [
      { name: 'Hyper Scarlet', hex: '#FF2A55', text: '#fff' },
      { name: 'Sunset Flame', hex: '#FF5722', text: '#fff' },
      { name: 'Platinum Ice', hex: '#F8FAFC', text: '#000' }
    ],
    badgeText: 'v2 Apex',
    badgeClass: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
    squircleClass: 'bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 shadow-glow-red',
    svg512: fs.readFileSync(path.join(assetsDir, 'forkpin-v2.svg'), 'utf8')
  },
  {
    id: 'v3',
    key: 'forkpin_v3',
    name: 'The ForkPin (v3 Geometric Crest)',
    label: 'v03 // Teardrop Precision',
    desc: 'Minimalist teardrop map pin with precision cutlery carved directly into the negative space ceramic core plate.',
    bestFor: 'Next-gen tech brand, mobile home screens, minimalist merchandise, global trademarking.',
    palette: [
      { name: 'Electric Crimson', hex: '#FF1E56', text: '#fff' },
      { name: 'Sunset Tangerine', hex: '#FF8008', text: '#fff' },
      { name: 'Pure Titanium', hex: '#FFFFFF', text: '#000' }
    ],
    badgeText: 'v3 Crest',
    badgeClass: 'border-orange-500/40 bg-orange-950/40 text-orange-300',
    squircleClass: 'bg-gradient-to-tr from-rose-600 via-orange-500 to-amber-400 shadow-glow-orange',
    svg512: fs.readFileSync(path.join(assetsDir, 'forkpin-v3.svg'), 'utf8')
  },
  {
    id: 'v4',
    key: 'forkpin_v4',
    name: 'The ClochePin (v4 Gourmet Reveal)',
    label: 'v04 // Gourmet Cloche Reveal',
    desc: 'A luxury fine-dining cloche dome whose handle is a map pushpin, lifting slightly to reveal golden culinary steam and fork tines beneath.',
    bestFor: 'Premium meal kits, Michelin-level curation, high-ticket subscriber tier branding.',
    palette: [
      { name: 'Gourmet Gold', hex: '#F59E0B', text: '#000' },
      { name: 'Royal Crimson', hex: '#E11D48', text: '#fff' },
      { name: 'Caviar Black', hex: '#0B0F17', text: '#fff' }
    ],
    badgeText: 'v4 Cloche',
    badgeClass: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
    squircleClass: 'bg-gradient-to-tr from-amber-500 via-rose-600 to-purple-900 shadow-glow-amber',
    svg512: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <defs>
    <linearGradient id="v4Gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="v4Red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF385C"/>
      <stop offset="100%" stop-color="#9F1239"/>
    </linearGradient>
    <filter id="v4Glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#F59E0B" flood-opacity="0.4"/>
    </filter>
  </defs>
  <!-- Base Serving Platter -->
  <ellipse cx="256" cy="380" rx="190" ry="46" fill="#0E1626" stroke="url(#v4Gold)" stroke-width="6"/>
  <ellipse cx="256" cy="374" rx="150" ry="32" fill="#070B12" stroke="#334155" stroke-width="3"/>
  <!-- Cloche Dome Lifted -->
  <g filter="url(#v4Glow)">
    <!-- Steam Swirls in Negative Reveal -->
    <path d="M 220,330 Q 210,290 230,260 T 225,220" stroke="#FDE68A" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.6"/>
    <path d="M 280,330 Q 295,290 275,260 T 285,220" stroke="#FDE68A" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.6"/>
    <!-- Dome Shell -->
    <path d="M 120,310 C 120,180 392,180 392,310 Z" fill="url(#v4Red)" stroke="url(#v4Gold)" stroke-width="5"/>
    <path d="M 112,310 L 400,310 L 396,322 L 116,322 Z" fill="url(#v4Gold)"/>
    <!-- Pushpin Handle atop Dome -->
    <circle cx="256" cy="148" r="38" fill="url(#v4Gold)"/>
    <circle cx="256" cy="148" r="14" fill="#FFFFFF"/>
    <path d="M 246,186 L 266,186 L 262,208 L 250,208 Z" fill="url(#v4Gold)"/>
    <!-- Fork Tines Revealed Beneath Platter -->
    <path d="M 236,334 L 236,370" stroke="url(#v4Gold)" stroke-width="5" stroke-linecap="round"/>
    <path d="M 256,330 L 256,376" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
    <path d="M 276,334 L 276,370" stroke="url(#v4Gold)" stroke-width="5" stroke-linecap="round"/>
  </g>
</svg>`
  },
  {
    id: 'v5',
    key: 'forkpin_v5',
    name: 'The Neon Bistro (v5 Continuous Monogram)',
    label: 'v05 // Neon Monogram Loop',
    desc: 'An unbroken, continuous fluid vector loop seamlessly linking the letter P, a location map pin, and an elegant 3-tine fork into a single glowing stroke.',
    bestFor: 'Modern lifestyle apps, hip urban delivery, neon signage, animated launch intros.',
    palette: [
      { name: 'Neon Coral', hex: '#FF3366', text: '#fff' },
      { name: 'Electric Violet', hex: '#8B5CF6', text: '#fff' },
      { name: 'Glow White', hex: '#FFFFFF', text: '#000' }
    ],
    badgeText: 'v5 Neon Loop',
    badgeClass: 'border-pink-500/40 bg-pink-950/40 text-pink-300',
    squircleClass: 'bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-700 shadow-glow-pink',
    svg512: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <defs>
    <linearGradient id="v5Neon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF3366"/>
      <stop offset="50%" stop-color="#F43F5E"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
    <filter id="v5Glow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="#FF3366" flood-opacity="0.7"/>
    </filter>
  </defs>
  <!-- Dark Vignette Canvas -->
  <circle cx="256" cy="256" r="210" fill="#0A0B10" stroke="#1E1E2E" stroke-width="6"/>
  <!-- Continuous Fluid Monogram Neon Stroke -->
  <g filter="url(#v5Glow)">
    <!-- Outer Plate Ambient Arc -->
    <path d="M 120,256 A 136,136 0 1,1 392,256" stroke="url(#v5Neon)" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.4"/>
    <!-- The Monogram P Loop that morphs into a MapPin head -->
    <path d="M 210,380 L 210,170 C 210,110 320,110 320,180 C 320,240 210,240 210,240" 
          stroke="url(#v5Neon)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <!-- Center Cutlery Tines branching from pin spine -->
    <path d="M 210,230 L 260,230 C 290,230 290,270 260,270 L 210,270" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" fill="none"/>
    <path d="M 256,230 L 256,270" stroke="url(#v5Neon)" stroke-width="12" stroke-linecap="round"/>
    <!-- Pin Focal Anchor -->
    <circle cx="210" cy="390" r="12" fill="#FFFFFF"/>
    <circle cx="210" cy="390" r="24" stroke="#8B5CF6" stroke-width="4" fill="none" opacity="0.8"/>
  </g>
</svg>`
  },
  {
    id: 'v6',
    key: 'forkpin_v6',
    name: 'CyberCutlery (v6 Hex Tech Badge)',
    label: 'v06 // Hexagonal Cyber Matrix',
    desc: 'High-tech algorithmic precision badge: a cybernetic hexagon housing crossed fork-and-knife laser vectors locked onto a grocery data nexus.',
    bestFor: 'AI-first grocery automation, tech-forward developer audience, automated pricing pipelines.',
    palette: [
      { name: 'Cyber Cyan', hex: '#06B6D4', text: '#000' },
      { name: 'Laser Rose', hex: '#F43F5E', text: '#fff' },
      { name: 'Dark Matrix', hex: '#030712', text: '#fff' }
    ],
    badgeText: 'v6 Cyber Hex',
    badgeClass: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300',
    squircleClass: 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-rose-600 shadow-glow-cyan',
    svg512: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <defs>
    <linearGradient id="v6CyanRose" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06B6D4"/>
      <stop offset="100%" stop-color="#F43F5E"/>
    </linearGradient>
    <filter id="v6Glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#06B6D4" flood-opacity="0.5"/>
    </filter>
  </defs>
  <!-- Cyber Hexagon Outer Border -->
  <polygon points="256,40 430,140 430,372 256,472 82,372 82,140" fill="#050B14" stroke="url(#v6CyanRose)" stroke-width="6"/>
  <polygon points="256,66 406,152 406,360 256,446 106,360 106,152" fill="#08101E" stroke="#1E293B" stroke-width="3"/>
  <g filter="url(#v6Glow)">
    <!-- Map Pin Apex Cap -->
    <circle cx="256" cy="160" r="48" fill="#F43F5E"/>
    <circle cx="256" cy="160" r="20" fill="#050B14"/>
    <circle cx="256" cy="160" r="8" fill="#06B6D4"/>
    <!-- Cybernetic Fork Stem -->
    <path d="M 256,208 L 256,360" stroke="#06B6D4" stroke-width="12" stroke-linecap="round"/>
    <!-- Angled Cross Tines -->
    <path d="M 216,240 L 216,330 Q 216,350 236,360" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M 296,240 L 296,330 Q 296,350 276,360" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" fill="none"/>
    <!-- Hex Data Nodes -->
    <circle cx="256" cy="380" r="10" fill="#F43F5E"/>
    <line x1="216" y1="240" x2="296" y2="240" stroke="#06B6D4" stroke-width="4"/>
  </g>
</svg>`
  },
  {
    id: 'v7',
    key: 'forkpin_v7',
    name: 'The Orbit Plate (v7 Kinetic Cart Delivery)',
    label: 'v07 // Orbital Cart Flow',
    desc: 'Dynamic 3D-perspective tilted plate encircled by a fast supermarket-cart orbit ring, with the culinary fork-needle locking into the exact recipe coordinates.',
    bestFor: 'Delivery focus, instant supermarket synchronization, high-momentum branding.',
    palette: [
      { name: 'Velocity Orange', hex: '#FF6B00', text: '#fff' },
      { name: 'Fresh Lime', hex: '#10B981', text: '#000' },
      { name: 'Deep Cosmic', hex: '#090D16', text: '#fff' }
    ],
    badgeText: 'v7 Orbit Flow',
    badgeClass: 'border-orange-500/40 bg-orange-950/40 text-orange-300',
    squircleClass: 'bg-gradient-to-tr from-orange-500 via-emerald-600 to-slate-900 shadow-glow-orange',
    svg512: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <defs>
    <linearGradient id="v7Grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF6B00"/>
      <stop offset="100%" stop-color="#10B981"/>
    </linearGradient>
    <filter id="v7Glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#FF6B00" flood-opacity="0.45"/>
    </filter>
  </defs>
  <!-- Tilted Isometric Perspective Plate -->
  <ellipse cx="256" cy="270" rx="190" ry="110" fill="#0C121E" stroke="#1E293B" stroke-width="8"/>
  <ellipse cx="256" cy="270" rx="145" ry="80" fill="#070A10" stroke="url(#v7Grad)" stroke-width="4" opacity="0.7"/>
  <!-- Kinetic 3D Orbital Velocity Ring -->
  <ellipse cx="256" cy="270" rx="220" ry="60" stroke="url(#v7Grad)" stroke-width="8" stroke-dasharray="24 14" transform="rotate(-20 256 270)"/>
  <!-- Vertical MapPin Fork Locking In -->
  <g filter="url(#v7Glow)">
    <circle cx="256" cy="116" r="46" fill="#FF6B00"/>
    <circle cx="256" cy="116" r="18" fill="#FFFFFF"/>
    <!-- Fork Body -->
    <path d="M 234,162 L 278,162 L 274,220 L 238,220 Z" fill="#E2E8F0"/>
    <!-- 3 Tines Anchoring into Dish Nexus -->
    <path d="M 226,220 L 226,300 C 226,325 240,335 248,340" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" fill="none"/>
    <path d="M 256,220 L 256,365" stroke="url(#v7Grad)" stroke-width="12" stroke-linecap="round"/>
    <path d="M 286,220 L 286,300 C 286,325 272,335 264,340" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" fill="none"/>
    <!-- Nexus Target Pulse -->
    <circle cx="256" cy="365" r="8" fill="#10B981"/>
  </g>
</svg>`
  },
  {
    id: 'v8',
    key: 'forkpin_v8',
    name: 'Minimalist Dual-Pin (v8 Cutlery Cross)',
    label: 'v08 // Nordic Minimalist Cross',
    desc: 'Understated Scandinavian geometric elegance: an ultra-clean circular plate framing a 45-degree crossed fork and spoon whose handles form dual map pinpoints.',
    bestFor: 'Sophisticated lifestyle editorial, organic gourmet groceries, elegant packaging.',
    palette: [
      { name: 'Warm Cream', hex: '#FEF3C7', text: '#000' },
      { name: 'Terracotta', hex: '#C2410C', text: '#fff' },
      { name: 'Slate Charcoal', hex: '#1E293B', text: '#fff' }
    ],
    badgeText: 'v8 Nordic Minimal',
    badgeClass: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
    squircleClass: 'bg-gradient-to-tr from-amber-200 via-orange-600 to-slate-900 shadow-glow-amber',
    svg512: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <defs>
    <filter id="v8Soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#C2410C" flood-opacity="0.35"/>
    </filter>
  </defs>
  <!-- Pure Ceramic Disc -->
  <circle cx="256" cy="256" r="216" fill="#0F172A" stroke="#334155" stroke-width="6"/>
  <circle cx="256" cy="256" r="176" fill="#0A0F1D" stroke="#C2410C" stroke-width="3" stroke-dasharray="8 6" opacity="0.6"/>
  <!-- Crossed Fork & Spoon Vectors with Pin Head Tips -->
  <g filter="url(#v8Soft)" transform="translate(0, 0)">
    <!-- Fork Diagonal Line (Left-Top to Right-Bottom) -->
    <line x1="160" y1="160" x2="352" y2="352" stroke="#FEF3C7" stroke-width="12" stroke-linecap="round"/>
    <!-- Fork 3 Minimalist Prongs -->
    <line x1="145" y1="175" x2="175" y2="145" stroke="#FEF3C7" stroke-width="8" stroke-linecap="round"/>
    <line x1="135" y1="150" x2="155" y2="130" stroke="#FEF3C7" stroke-width="6" stroke-linecap="round"/>
    <line x1="165" y1="180" x2="185" y2="160" stroke="#FEF3C7" stroke-width="6" stroke-linecap="round"/>
    <circle cx="352" cy="352" r="16" fill="#C2410C"/>
    <!-- Spoon Diagonal Line (Right-Top to Left-Bottom) -->
    <line x1="352" y1="160" x2="160" y2="352" stroke="#FEF3C7" stroke-width="12" stroke-linecap="round"/>
    <!-- Spoon Oval Bowl -->
    <ellipse cx="340" cy="172" rx="26" ry="16" fill="#FEF3C7" transform="rotate(-45 340 172)"/>
    <circle cx="160" cy="352" r="16" fill="#C2410C"/>
    <!-- Center Target Intersection Point -->
    <circle cx="256" cy="256" r="18" fill="#C2410C"/>
    <circle cx="256" cy="256" r="7" fill="#FEF3C7"/>
  </g>
</svg>`
  },
  {
    id: 'v9',
    key: 'forkpin_v9',
    name: 'The FlamePin (v9 Culinary Torch Induction)',
    label: 'v09 // Ember Flame & Fork',
    desc: 'Passionate culinary energy: a dynamic kitchen fire flame forming an organic teardrop pushpin silhouette, with fork tines rising like glowing embers.',
    bestFor: 'Hot trending recipes, spice-loving audiences, bold energetic brand campaigns.',
    palette: [
      { name: 'Fire Ruby', hex: '#EF4444', text: '#fff' },
      { name: 'Ember Yellow', hex: '#FACC15', text: '#000' },
      { name: 'Charcoal Dark', hex: '#111827', text: '#fff' }
    ],
    badgeText: 'v9 Flame Core',
    badgeClass: 'border-red-500/40 bg-red-950/40 text-red-300',
    squircleClass: 'bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 shadow-glow-red',
    svg512: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <defs>
    <linearGradient id="v9Flame" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FACC15"/>
      <stop offset="50%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#DC2626"/>
    </linearGradient>
    <filter id="v9FireGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="20" flood-color="#DC2626" flood-opacity="0.6"/>
    </filter>
  </defs>
  <!-- Flame Plate Base Rim -->
  <circle cx="256" cy="256" r="214" fill="#0C0F17" stroke="#1F2937" stroke-width="6"/>
  <circle cx="256" cy="256" r="172" stroke="url(#v9Flame)" stroke-width="3" opacity="0.4" stroke-dasharray="10 6"/>
  <!-- The Flame-Pin Dynamic Vector -->
  <g filter="url(#v9FireGlow)">
    <!-- Organic Rising Flame Contour forming Pin Silhouette -->
    <path d="M 256,64 C 200,140 140,210 140,290 C 140,365 192,426 256,426 C 320,426 372,365 372,290 C 372,210 312,140 256,64 Z" 
          fill="url(#v9Flame)"/>
    <!-- Inner Heat Core (White-Yellow Fire Negative) -->
    <path d="M 256,150 C 224,204 186,250 186,306 C 186,350 218,386 256,386 C 294,386 326,350 326,306 C 326,250 288,204 256,150 Z" 
          fill="#111827"/>
    <!-- Fork Prongs Emerging as Clean Sparks from Ember -->
    <path d="M 230,240 L 230,320 M 256,210 L 256,336 M 282,240 L 282,320" stroke="#FACC15" stroke-width="8" stroke-linecap="round"/>
    <circle cx="256" cy="358" r="8" fill="#FFFFFF"/>
  </g>
</svg>`
  },
  {
    id: 'v10',
    key: 'forkpin_v10',
    name: 'Golden Ratio Monogram (v10 P2P Apex Shield)',
    label: 'v10 // Luxury Monogram Shield',
    desc: 'Ultra-prestigious crest geometry: a golden interlocking P and 2 monogram forming an impenetrable luxury dining shield with embedded cutlery balance.',
    bestFor: 'High-end venture capital backing, enterprise food partnerships, global consumer trust.',
    palette: [
      { name: 'Imperial Gold', hex: '#D97706', text: '#fff' },
      { name: 'Champagne Glow', hex: '#FDE68A', text: '#000' },
      { name: 'Obsidian Velvet', hex: '#050508', text: '#fff' }
    ],
    badgeText: 'v10 Apex Shield',
    badgeClass: 'border-yellow-500/40 bg-yellow-950/40 text-yellow-300',
    squircleClass: 'bg-gradient-to-tr from-yellow-600 via-amber-600 to-stone-900 shadow-glow-yellow',
    svg512: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <defs>
    <linearGradient id="v10Gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#78350F"/>
    </linearGradient>
    <filter id="v10ShieldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#D97706" flood-opacity="0.45"/>
    </filter>
  </defs>
  <!-- Luxury Shield Contour -->
  <path d="M 256,44 L 416,110 L 416,270 C 416,366 256,464 256,464 C 256,464 96,366 96,270 L 96,110 Z" 
        fill="#08080E" stroke="url(#v10Gold)" stroke-width="8"/>
  <path d="M 256,76 L 388,132 L 388,266 C 388,344 256,426 256,426 C 256,426 124,344 124,266 L 124,132 Z" 
        fill="#040406" stroke="#27272A" stroke-width="3"/>
  <g filter="url(#v10ShieldGlow)">
    <!-- Central Monogram P2P Lockup with Fork Spine -->
    <!-- The Golden Plate Ring inside Shield -->
    <circle cx="256" cy="220" r="86" stroke="url(#v10Gold)" stroke-width="6" fill="#0A0A12"/>
    <circle cx="256" cy="220" r="70" stroke="#3F3F46" stroke-width="2" fill="none" opacity="0.6"/>
    <!-- The Pin Point piercing down into the shield tip -->
    <path d="M 256,220 L 256,380" stroke="url(#v10Gold)" stroke-width="12" stroke-linecap="round"/>
    <!-- Fork Prongs Cresting within the Gold Circle -->
    <path d="M 226,170 L 226,240 C 226,260 242,268 256,268 C 270,268 286,260 286,240 L 286,170" 
          stroke="#FDE68A" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path d="M 256,150 L 256,240" stroke="url(#v10Gold)" stroke-width="8" stroke-linecap="round"/>
    <!-- Shield Anchor Diamond -->
    <polygon points="256,370 266,384 256,398 246,384" fill="#FDE68A"/>
  </g>
</svg>`
  }
];

// Write all SVGs and render 512 PNGs
console.log('✨ Generating 10 Pin2Plate Brand Vector Masters & PNG Renders...');

for (const logo of logos) {
  const svgFilename = `forkpin-${logo.id}.svg`;
  const pngFilename = `forkpin-${logo.id}-512.png`;
  const svgPath = path.join(assetsDir, svgFilename);
  const pngPath = path.join(assetsDir, pngFilename);

  fs.writeFileSync(svgPath, logo.svg512, 'utf8');
  console.log(`✅ Saved SVG: ${svgFilename}`);

  try {
    const cmd = `npx -y sharp-cli -i "${svgPath}" -o "${pngPath}" --format png resize 512 512`;
    execSync(cmd, { stdio: 'pipe' });
    console.log(`🖼️  Rendered PNG: ${pngFilename} (512x512)`);
  } catch (e) {
    console.error(`❌ Failed to render ${pngFilename}:`, e.message);
  }
}

// Write JSON metadata for easy inclusion
fs.writeFileSync(path.join(assetsDir, 'logos-metadata.json'), JSON.stringify(logos, null, 2), 'utf8');
console.log('🎉 All 10 logos generated and saved successfully!');
