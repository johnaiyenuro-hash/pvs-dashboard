/**
 * Mercor Automated Role Ingestion Engine
 * Pulls real-time live opportunities directly from Mercor AWS API,
 * filters against CAD / AEC / BIM / CDE criteria and adjacent technical domains,
 * and generates live-roles.json + live-roles.js.
 */

const fs = require('fs');
const path = require('path');

const MERCOR_ENDPOINT = 'https://aws.api.mercor.com/work/listings-explore-page';
const OUTPUT_JSON = path.join(__dirname, 'live-roles.json');
const OUTPUT_JS = path.join(__dirname, 'live-roles.js');

// Strict title/domain disqualification (avoids false positives from EEO boilerplate)
const EXCLUSION_PATTERNS = [
  /\b(physician|radiologist|cardiologist|surgeon|oncologist|neurologist|psychiatrist|pediatric|urologist|hospitalist|clinician|clinical|nurs(e|ing)|pharmac(y|ist)|orthodontist|medical coder|doctor|dentist|biolog(y|ist)|biochem|chemist(ry)?|genomics|preclinical|pharma|therap(y|ist)|veterinar)\b/i,
  /\b(lawyer|attorney|paralegal|legal expert|counsel|litigation|tax professional|cpa\b)\b/i,
  /\b(audiobook|voice actor|voice cloning|linguistic|lyrics|music producer|audio engineer|video editor|colorist|cinematographer|motion designer|vfx|tutor|youth study)\b/i,
  /\b(copywriting|copywriter|blog post|creative writing|transcription|customer service|customer support\b|sales representative|securities|trader|loan underwriter|banking & m&a|private equity|investment banking|insurance domain)\b/i,
  /\b(survey research|consumer insights|brokers survey|clinical survey|market research|patient population)\b/i,
  /\b(kernel engineer|trainium|gpu kernel|cve vulnerability|swe-bench|serverless|kubernetes|rust|kernel expert)\b/i,
  /\b(software engineer \(foundational\)|software & firmware|software engineering expert|software engineer — agentic|software engineer \(ai-native)\b/i,
  /\b(marketing domain|finance domain|formal mathematics|behavioral health|mathematics domain|life, physical|materials science expert|physics expert|mathematics expert|chemistry expert|biotechnology expert)\b/i
];

// Technical domain anchors (Core + Adjacent)
const ANCHOR_PATTERNS = [
  {
    id: 'ARCH_CORE',
    name: 'Architecture & ArchViz',
    tier: 1,
    titleRegex: /\b(architectural|architect\b|archviz|interior design|spatial design)\b/i,
    bodyRegex: /\b(architectural|building architect|archviz|interior design|spatial design|building code|plan sets|floor plans|elevations and sections|architectural render|photoreal render)\b/i,
    antiRegex: /\b(software architect|solutions? architect|cloud architect|enterprise architect|systems? architect)\b/i
  },
  {
    id: 'BIM_CDE',
    name: 'BIM & ISO 19650 / CDE',
    tier: 1,
    titleRegex: /\b(bim\b|revit|navisworks|cde\b|information manager|iso 19650)\b/i,
    bodyRegex: /\b(revit|bim\b|navisworks|clash detection|cde\b|common data environment|glider|gliderbim|iso 19650|cobie|aim\b|ifc\b|aconex|eir\b|air\b)\b/i
  },
  {
    id: 'CAD_DRAFTING',
    name: 'AutoCAD & Technical Drafting',
    tier: 1,
    titleRegex: /\b(autocad|cad\b|drafting|drafter|draftsperson)\b/i,
    bodyRegex: /\b(autocad|cad\b|drafting|drafter|draftsperson|dwg\b|technical drawing|detail drafting|drawing set|laser scan|point cloud)\b/i
  },
  {
    id: '3D_MODELING',
    name: '3D Modeling & Visualization',
    tier: 1,
    titleRegex: /\b(3d generalist|3d model|3d artist|visualization specialist)\b/i,
    bodyRegex: /\b(3d modeling|3d generalist|photoreal render|v-ray|enscape|lumion|twinmotion|sketchup|rhino|blender cycles|3ds max)\b/i
  },
  {
    id: 'CIVIL_STRUCTURAL',
    name: 'Civil & Structural Adjacent',
    tier: 2,
    titleRegex: /\b(civil|structural|site civil|land survey)\b/i,
    bodyRegex: /\b(civil engineer|structural engineer|site civil|structural design|survey engineer|land survey|infrastructure design|civil 3d)\b/i
  },
  {
    id: 'MECH_CAD',
    name: 'Mechanical & Product CAD',
    tier: 2,
    titleRegex: /\b(mechanical|solidworks|inventor|catia|creo|cad engineer)\b/i,
    bodyRegex: /\b(mechanical engineer|solidworks|catia|nx\b|creo|autodesk inventor|mechanical cad|3d cad modeling|sheet metal|drafting standards)\b/i
  },
  {
    id: 'ENG_REVIEW',
    name: 'Engineering Review & AI Evaluation',
    tier: 2,
    titleRegex: /\b(engineering expert|engineer reviewer|engineering writer|engineering & simulation|engineering & software)\b/i,
    bodyRegex: /\b(engineering reviewer|engineering writer|engineering evaluation|engineering benchmark|simulation expert)\b/i
  },
  {
    id: 'AEC_PROJECT_DELIVERY',
    name: 'Project Delivery & Operations',
    tier: 2,
    titleRegex: /\b(project management specialist|expert project manager|project delivery|document designer|compliance & risk|knowledge work specialist)\b/i,
    bodyRegex: /\b(tender pack|procurement pack|project delivery|document workflows|eir|compliance & risk|quality control|stakeholder coordination|deck & document)\b/i
  },
  {
    id: 'TECH_SOFTWARE_USER',
    name: 'Technical Software Specialist',
    tier: 3,
    titleRegex: /\b(application users.*(autocad|solidworks|inventor|excel|unreal|blender)|excel expert)\b/i,
    bodyRegex: /\b(autocad mechanical|solidworks premium|inventor professional|excel expert|spreadsheet specialist)\b/i
  }
];

function generateVerdictAndPitch(title, detectedAnchors, rateMax) {
  const anchorIds = detectedAnchors.map(a => a.id);
  const isHighLeverage = rateMax >= 90;

  // 1. Direct Architecture & ArchViz
  if (/architect(ural|s)?\b|archviz|interior design|spatial design/i.test(title)) {
    const verdict = isHighLeverage ? 'TIER 1: HIGH-LEVERAGE ARCHITECTURE ($90+)' : 'TIER 1: ARCHITECTURE / ARCHVIZ CORE';
    const score = isHighLeverage ? 98 : 95;
    const pitch = 'Registered Architectural Designer & BIM specialist with 6+ years\' delivery experience across complex projects, AutoCAD plan sets, Revit authoring, 3D laser scan point clouds, and photoreal visualization. Flawless construction judgment and zero rework.';
    return { verdict, score, pitch };
  }

  // 2. Direct BIM & ISO 19650 / CDE
  if (/cde\b|iso 19650|information manager|glider|bim manager|bim coordinator/i.test(title) || (anchorIds.includes('BIM_CDE') && !/mechanical|electrical|civil|writer|reviewer|software/i.test(title))) {
    const verdict = 'TIER 1: CDE / ISO 19650 SPECIALIST';
    const score = 98;
    const pitch = 'Specialized CAD/CDE practitioner and Information Manager with hands-on experience in ISO 19650 workflows, GliderBIM, EIR/AIR validation, IFC/COBie auditing, and drawing package delivery. Available immediately.';
    return { verdict, score, pitch };
  }

  // 3. 3D Modeling & Visualization
  if (/3d (generalist|model(er|ing)?|artist)|visualization specialist/i.test(title)) {
    const verdict = isHighLeverage ? 'TIER 1: 3D MODELING TARGET ($90+)' : 'TIER 1: 3D VISUALIZATION SPECIALIST';
    const score = isHighLeverage ? 95 : 92;
    const pitch = 'Experienced 3D modeler and visualization specialist with extensive background across precision CAD, 3D laser point clouds, photoreal scene generation, and spatial design standards. Zero rework guarantee.';
    return { verdict, score, pitch };
  }

  // 4. Civil & Structural
  if (/civil|structural|survey/i.test(title)) {
    const verdict = isHighLeverage ? 'EXPANSION: CIVIL / STRUCTURAL ($90+)' : 'EXPANSION: CIVIL / STRUCTURAL ADJACENT';
    const score = isHighLeverage ? 94 : 89;
    const pitch = 'Senior technical CAD & drafting specialist with deep background in AutoCAD Civil/Structural drawing packages, site coordinates, 3D laser surveys, and rigorous drawing deliverable quality control.';
    return { verdict, score, pitch };
  }

  // 5. Mechanical & Product CAD
  if (/mechanical|solidworks|inventor|catia|creo/i.test(title)) {
    const verdict = isHighLeverage ? 'EXPANSION: MECHANICAL CAD ($90+)' : 'EXPANSION: MECHANICAL & PRODUCT CAD';
    const score = isHighLeverage ? 93 : 88;
    const pitch = 'Experienced Mechanical & CAD specialist with strong proficiency in 3D modeling, drawing standards, tolerance verification, and technical deliverable accuracy. Immediate availability.';
    return { verdict, score, pitch };
  }

  // 6. Direct Engineering Review & AI Evaluation
  if (/reviewer|writer|engineering expert|simulation expert|domain expert/i.test(title)) {
    const verdict = isHighLeverage ? 'EXPANSION: ENGINEERING REVIEW / SME ($90+)' : 'EXPANSION: TECHNICAL REVIEW & EVALUATION';
    const score = isHighLeverage ? 92 : 87;
    const pitch = 'Senior technical specialist with extensive experience in multi-disciplinary design review, technical specification writing, AutoCAD/Revit quality control, and rigorous regulatory compliance auditing.';
    return { verdict, score, pitch };
  }

  // 7. Project Delivery, Operations & Compliance
  if (/project|operations|document designer|compliance/i.test(title)) {
    const verdict = 'EXPANSION: PROJECT DELIVERY & OPS';
    const score = 86;
    const pitch = 'Project Delivery Lead & Information Manager with 6+ years\' experience managing multi-stakeholder workflows, technical drawing and document packages, ISO compliance auditing, and deadline-driven delivery with zero errors.';
    return { verdict, score, pitch };
  }

  // 8. Technical Software Specialist
  if (/application users|excel expert/i.test(title)) {
    const verdict = 'EXPANSION: TECHNICAL SOFTWARE SPECIALIST';
    const score = 82;
    const pitch = 'Power user and technical specialist with daily production mastery in CAD software (AutoCAD, SolidWorks, Inventor) and advanced Excel data modeling. Fast, high-accuracy execution.';
    return { verdict, score, pitch };
  }

  // Fallback
  const verdict = isHighLeverage ? 'EXPANSION: TECHNICAL TARGET ($90+)' : 'EXPANSION: TECHNICAL ADJACENT';
  const score = isHighLeverage ? 90 : 80;
  const pitch = 'Senior CAD & technical drafting specialist with extensive experience in AutoCAD production, WCS coordinates, 3D laser point clouds, and drawing deliverable quality control. Zero rework guarantee.';
  return { verdict, score, pitch };
}

async function syncMercorRoles() {
  console.log('[Mercor Sync] Connecting to Mercor AWS API...');
  const res = await fetch(MERCOR_ENDPOINT, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://work.mercor.com',
      'Referer': 'https://work.mercor.com/explore'
    }
  });

  if (!res.ok) {
    throw new Error(`Mercor API responded with status ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const rawListings = data.listings || [];
  console.log(`[Mercor Sync] Retrieved ${rawListings.length} total active listings from Mercor.`);

  const filteredRoles = [];

  for (const item of rawListings) {
    const title = item.title || '';
    const desc = item.description || '';
    const combined = `${title}\n${desc}`;

    // Disqualification check by title (avoids false positives from EEO boilerplate)
    const isExcluded = EXCLUSION_PATTERNS.some(re => re.test(title));
    if (isExcluded) continue;

    // Rate floor and hourly frequency
    const rateMin = item.rateMin || 0;
    const rateMax = item.rateMax || rateMin;
    if (rateMax < 40 || rateMax > 500) continue; // Exclude sub-$40 or annual salary listings
    if (item.payRateFrequency === 'annual') continue;

    // Detect technical anchors
    const detectedAnchors = [];
    for (const anchor of ANCHOR_PATTERNS) {
      if (anchor.antiRegex && anchor.antiRegex.test(title)) continue;
      const titleHit = anchor.titleRegex.test(title);
      const bodyHit = anchor.bodyRegex.test(combined);

      if (titleHit || bodyHit) {
        detectedAnchors.push(anchor);
      }
    }

    if (detectedAnchors.length === 0) continue;

    // Check title relevance (Core Architecture/CAD/BIM or Adjacent Engineering/Review/Operations/Software)
    const titleKeywords = /\b(architect|architectural|archviz|cad|drafting|drafter|bim|revit|civil|mechanical|structural|engineering|solidworks|autocad|inventor|cde|survey|3d|visualization|designer|writer|reviewer|expert|specialist|lead|operations|project|application users)\b/i;
    const titleIsTarget = titleKeywords.test(title);

    if (titleIsTarget) {
      // If no anchor matches the title directly, require a tier 1 anchor or at least 2 detected anchors
      const hasTitleAnchor = detectedAnchors.some(a => a.titleRegex.test(title));
      const hasTier1 = detectedAnchors.some(a => a.tier === 1);
      if (!hasTitleAnchor && !hasTier1 && detectedAnchors.length < 2) continue;

      const { verdict, score, pitch } = generateVerdictAndPitch(title, detectedAnchors, rateMax);

      filteredRoles.push({
        id: item.listingId,
        uid: item.uid,
        title: item.title,
        rateMin,
        rateMax,
        rateFormatted: rateMin === rateMax ? `$${rateMin}/hr` : `$${rateMin}–$${rateMax}/hr`,
        payRateFrequency: item.payRateFrequency || 'hourly',
        commitment: item.commitment || 'contract',
        location: item.location || 'Remote',
        postedAt: item.postedAt || item.createdAt,
        directUrl: `https://work.mercor.com/explore?listingId=${item.listingId}`,
        anchors: detectedAnchors.map(a => a.name),
        verdict,
        score,
        pitch,
        hoursPerWeek: item.hoursPerWeek,
        remainingSlots: item.remainingSlots
      });
    }
  }

  // Sort by score descending, then by rate descending, then by posted date
  filteredRoles.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.rateMax !== a.rateMax) return b.rateMax - a.rateMax;
    return new Date(b.postedAt) - new Date(a.postedAt);
  });

  const outputPayload = {
    syncedAt: new Date().toISOString(),
    totalScanned: rawListings.length,
    matchingCount: filteredRoles.length,
    roles: filteredRoles
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(outputPayload, null, 2), 'utf8');
  fs.writeFileSync(OUTPUT_JS, `window.MERCOR_LIVE_DATA = ${JSON.stringify(outputPayload, null, 2)};\n`, 'utf8');
  console.log(`[Mercor Sync] Successfully filtered and exported ${filteredRoles.length} approved roles to ${OUTPUT_JSON} and ${OUTPUT_JS}`);
  return outputPayload;
}

if (require.main === module) {
  syncMercorRoles().catch(err => {
    console.error('[Mercor Sync Error]', err);
    process.exit(1);
  });
}

module.exports = { syncMercorRoles };
